import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.VOICELIVE_SOCKET_SECRET;

  if (!token) {
    return Response.json(
      { error: 'Voice service is not configured' },
      { status: 503 }
    );
  }

  return Response.json({ token });
}
