import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { deleteUserData } from '@/app/api/user/progress/route';

interface ClerkWebhookPayload {
  data?: {
    id?: string;
    deleted?: boolean;
  };
  type?: string;
}

function verifySvixSignature(
  secret: string,
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string
): boolean {
  try {
    const key = secret.startsWith('whsec_')
      ? Buffer.from(secret.slice(6), 'base64')
      : Buffer.from(secret, 'utf8');

    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(svixTimestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
      return false;
    }

    const toSign = `${svixId}.${svixTimestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', key)
      .update(toSign)
      .digest('base64');

    const passedSignatures = svixSignature.split(' ');
    for (const versionedSig of passedSignatures) {
      const [version, sig] = versionedSig.split(',');
      if (version === 'v1' && sig) {
        const sigBuf = Buffer.from(sig, 'base64');
        const expBuf = Buffer.from(expectedSignature, 'base64');
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Clerk Webhook] Rejected: CLERK_WEBHOOK_SECRET is not configured on server.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
  }

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing webhook signature headers' }, { status: 401 });
  }

  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ error: 'Empty payload' }, { status: 400 });
    }

    const isValid = verifySvixSignature(webhookSecret, rawBody, svixId, svixTimestamp, svixSignature);
    if (!isValid) {
      console.warn('[Clerk Webhook] Rejected unauthorized request: invalid signature or expired timestamp');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload: ClerkWebhookPayload = JSON.parse(rawBody);

    if (payload.type === 'user.deleted' && payload.data?.id) {
      const userId = payload.data.id;
      await deleteUserData(userId);
      console.log(`[Clerk Webhook] Successfully purged progress data for deleted user ${userId}`);
      return NextResponse.json({ success: true, purged: userId });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Clerk Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
