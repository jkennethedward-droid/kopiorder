# KopiOrder

Mobile-first web app to build a Singapore kopi order and play it back as audio tiles.

## Local development

Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Create `.env.local` (never committed) based on `.env.local.example`:

```bash
copy .env.local.example .env.local
```

Set:

- **`ELEVENLABS_API_KEY`**: required for ElevenLabs TTS (used only from `pages/api/speak.ts`).
- **`NEXT_PUBLIC_SITE_URL`** (optional): base URL used for Open Graph/Twitter meta tags (defaults to `https://kopiorder.vercel.app`).

If ElevenLabs fails or returns empty audio, the app silently falls back to the browser’s Web Speech API.

## Deploy (Vercel)

In Vercel Project Settings → Environment Variables, add:

- `ELEVENLABS_API_KEY`
- (optional) `NEXT_PUBLIC_SITE_URL` = `https://kopiorder.vercel.app`

Then deploy normally.
