import { GET as getFeed } from '@/app/feed.xml/route';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  return getFeed(new Request('https://www.leetmap-pro.com/feed.xml?format=atom'));
}
