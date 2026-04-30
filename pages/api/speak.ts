export const config = {
  runtime: "edge",
};

const SG_VOICE_ID = "5JeodniElPwfCu77pH9H";
const ZH_VOICE_ID = "vZZLclMx4wouUtKBRfZn";
const TTS_SPEED_SG = 0.85;
const TTS_SPEED_ZH = 0.9;

type Body = { text?: string; mode?: "sg" | "zh" };

const MAX_BODY_BYTES = 12_000; // small JSON payload only
const MAX_TEXT_CHARS = 600;

function jsonError(status: number, error: string) {
  return new Response(JSON.stringify({ error }, null, 2), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return jsonError(500, "Something went wrong");

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError(400, "Invalid request");
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonError(400, "Invalid request");
  }

  const text = (body.text ?? "").trim().slice(0, MAX_TEXT_CHARS);
  const mode = body.mode === "zh" ? "zh" : "sg";
  if (!text) return jsonError(400, "Invalid request");

  const voiceId = mode === "sg" ? SG_VOICE_ID : ZH_VOICE_ID;
  const speed = mode === "sg" ? TTS_SPEED_SG : TTS_SPEED_ZH;

  let upstream: Response;
  try {
    upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
  } catch {
    return jsonError(500, "Something went wrong");
  }

  if (!upstream.ok || !upstream.body) {
    return jsonError(500, "Something went wrong");
  }

  return new Response(upstream.body, {
    headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
  });
}

