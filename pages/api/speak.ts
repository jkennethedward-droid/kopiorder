export const config = {
  runtime: "edge",
};

const SG_VOICE_ID = "5JeodniElPwfCu77pH9H";
const ZH_VOICE_ID = "vZZLclMx4wouUtKBRfZn";
const TTS_SPEED_SG = 0.85;
const TTS_SPEED_ZH = 0.9;

type Body = { text?: string; mode?: "sg" | "zh" };

const SG_PRONUNCIATION_GUIDE = [
  "Speak the following kopitiam words exactly as shown. These are Singapore hawker terms and must sound natural, not anglicised.",
  "",
  'Kopi - say "koh-pee". Short o, stress on first syllable.',
  'Teh - say "teh". Rhymes with "meh", never say "tay".',
  'Kopi-C - say "koh-pee... see". Slight pause between kopi and C.',
  'Teh-C - say "teh... see". Same slight pause.',
  'Kopi-O - say "koh-pee... oh". Clear separation, stress each syllable equally.',
  'Teh-O - say "teh... oh". Two distinct syllables, not run together.',
  'Siu Dai - say "siu... die". Siu rhymes with "few". Dai rhymes with "die".',
  'Kosong - say "koh-song". Soft g at the end, not "koh-zong".',
  'Gah Dai - say "gah... die". Hard g.',
  'Gau - say "gow". Rhymes with "cow". Means strong.',
  'Poh - say "poh". Short o, rhymes with "doh".',
  'Peng - say "pung". Rhymes with "lung" and "sung". Never say "peng" like penguin.',
  'Dabao - say "dah-bao". Dah is a short a. Bao rhymes with "cow".',
  'Yuan Yang - say "yoo-en... yong". Soft yoo-en. Yong rhymes with "song".',
  'Milo - say "my-lo".',
  'Horlicks - say "hor-licks".',
  'PayNow - say "pay... now". Two clear words, slight pause between them.',
  'Cash - say "cash".',
  'Card - say "card".',
].join("\n");

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return new Response("Missing ELEVENLABS_API_KEY", { status: 500 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const rawText = (body.text ?? "").trim();
  const mode = body.mode === "zh" ? "zh" : "sg";
  if (!rawText) return new Response("Missing text", { status: 400 });

  const voiceId = mode === "sg" ? SG_VOICE_ID : ZH_VOICE_ID;
  const speed = mode === "sg" ? TTS_SPEED_SG : TTS_SPEED_ZH;
  const text = mode === "sg" ? `${SG_PRONUNCIATION_GUIDE}\n\n${rawText}` : rawText;

  const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "audio/mpeg",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, speed },
    }),
  });

  if (!upstream.ok) {
    let details = "";
    try {
      details = await upstream.text();
    } catch {
      details = "";
    }
    return new Response(
      JSON.stringify(
        {
          error: "TTS upstream failed",
          upstream_status: upstream.status,
          upstream_status_text: upstream.statusText,
          upstream_body: details.slice(0, 2000),
        },
        null,
        2,
      ),
      {
        status: 502,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      },
    );
  }

  if (!upstream.body) {
    return new Response(
      JSON.stringify(
        {
          error: "TTS upstream returned no body",
          upstream_status: upstream.status,
        },
        null,
        2,
      ),
      {
        status: 502,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "no-store",
    },
  });
}

