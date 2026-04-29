export const config = {
  runtime: "edge",
};

const SG_VOICE_ID = "FXMPPfJPpDj0GSwJ6ASO";
const ZH_VOICE_ID = "vZZLclMx4wouUtKBRfZn";

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

  const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("TTS failed", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "no-store",
    },
  });
}

