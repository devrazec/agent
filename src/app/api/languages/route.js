import { NextResponse } from 'next/server';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', voice: 'en-US-AvaNeural' },
  { code: 'en-GB', name: 'English (UK)', voice: 'en-GB-SoniaNeural' },
  { code: 'es-ES', name: 'Spanish (Spain)', voice: 'es-ES-ElviraNeural' },
  { code: 'es-MX', name: 'Spanish (Mexico)', voice: 'es-MX-DaliaNeural' },
  { code: 'fr-FR', name: 'French', voice: 'fr-FR-DeniseNeural' },
  { code: 'de-DE', name: 'German', voice: 'de-DE-KatjaNeural' },
  { code: 'it-IT', name: 'Italian', voice: 'it-IT-ElsaNeural' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', voice: 'pt-BR-FranciscaNeural' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', voice: 'zh-CN-XiaoxiaoNeural' },
  { code: 'ja-JP', name: 'Japanese', voice: 'ja-JP-NanamiNeural' },
  { code: 'ko-KR', name: 'Korean', voice: 'ko-KR-SunHiNeural' },
  { code: 'ar-SA', name: 'Arabic', voice: 'ar-SA-ZariyahNeural' },
  { code: 'ru-RU', name: 'Russian', voice: 'ru-RU-SvetlanaNeural' },
  { code: 'nl-NL', name: 'Dutch', voice: 'nl-NL-ColetteNeural' },
  { code: 'pl-PL', name: 'Polish', voice: 'pl-PL-AgnieszkaNeural' },
];

export async function GET() {
  return NextResponse.json({ languages: LANGUAGES });
}
