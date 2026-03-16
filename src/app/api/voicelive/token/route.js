import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.AZURE_VOICELIVE_API_KEY;
  const endpoint = process.env.AZURE_VOICELIVE_ENDPOINT;
  const model = process.env.AZURE_VOICELIVE_MODEL || 'gpt-4o-mini-realtime-preview';

  if (!apiKey || !endpoint) {
    return NextResponse.json(
      { error: 'Azure VoiceLive credentials are not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json({ apiKey, endpoint, model });
}
