export async function GET() {
  return Response.json({ token: process.env.NEXT_PUBLIC_VOICELIVE_API_KEY_1 });
}