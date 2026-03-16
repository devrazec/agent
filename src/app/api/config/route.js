import { NextResponse } from 'next/server';

export async function GET() {
  const endpoint = process.env.AZURE_VOICELIVE_ENDPOINT;
  const model = process.env.AZURE_VOICELIVE_MODEL || 'gpt-4o-mini-realtime-preview';

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Azure VoiceLive endpoint is not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json({ endpoint, model });
}
