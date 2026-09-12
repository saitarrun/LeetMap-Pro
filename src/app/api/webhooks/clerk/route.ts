import { NextResponse } from 'next/server';
import { deleteUserData } from '@/app/api/user/progress/route';

interface ClerkWebhookPayload {
  data?: {
    id?: string;
    deleted?: boolean;
  };
  type?: string;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ error: 'Empty payload' }, { status: 400 });
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
