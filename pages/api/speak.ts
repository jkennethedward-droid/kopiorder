export const config = {
  runtime: "edge",
};

const SG_VOICE_ID = "5JeodniElPwfCu77pH9H";
const ZH_VOICE_ID = "vZZLclMx4wouUtKBRfZn";
const TTS_SPEED_SG = 0.85;
const TTS_SPEED_ZH = 0.9;

type Body = { text?: string; mode?: "sg" | "zh" };

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

  const text = (body.text ?? "").trim();
  const mode = body.mode === "zh" ? "zh" : "sg";
  if (!text) return new Response("Missing text", { status: 400 });

  const voiceId = mode === "sg" ? SG_VOICE_ID : ZH_VOICE_ID;
  const speed = mode === "sg" ? TTS_SPEED_SG : TTS_SPEED_ZH;

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
      // Higher stability reduces variation between runs.
      voice_settings: { stability: 0.85, similarity_boost: 0.8, speed },
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

