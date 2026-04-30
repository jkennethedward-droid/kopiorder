# KopiOrder

Order kopi like a local.

KopiOrder helps anyone order drinks at a Singapore kopitiam without freezing at the counter. Built for tourists, new residents, and anyone who has ever blanked when the auntie stared at them.

Pick your drink, hear your order, press play.

Live demo: `https://kopiorder.vercel.app`

---

## What it does

Walking up to a kopitiam counter sounds simple until you realise you need to know the difference between kopi-C siu dai and teh-O kosong on the spot, with a queue behind you.

KopiOrder guides you through a one-question-at-a-time flow. By the time you get there, your order is ready. One tap plays it aloud in Singapore kopitiam lingo or Mandarin Chinese.

No more pointing. No more apologetic smiling. Just press play.

---

## Features

- Guided drink builder, one question at a time, Typeform-style animation
- Supports: Kopi, Teh, Milo, Horlicks, Yuan Yang (and their variations)
- Compiles clear, natural spoken phrases for each drink (not a word dump)
- Two output modes: Singapore kopitiam lingo and Mandarin Chinese
- Add up to 5 drinks per order, each with individual quantity control
- Edit any drink after adding it without losing the rest of the order
- ElevenLabs TTS for voice output
- Silent fallback to Web Speech API if the TTS call fails or returns empty audio
- Mobile-only, built for the browser, no app store needed
- No database, no login, no saved data. Refresh and start fresh.

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js (Pages Router) + TypeScript |
| Voice output | ElevenLabs TTS API (via Edge Function proxy) |
| Fallback voice | Web Speech API (browser-native) |
| Hosting | Vercel |
| Fonts | Syne + DM Sans (Google Fonts) |
| State | React `useState` only |

No database. No auth. No external UI libraries.

---

## Getting started

### Prerequisites

- Node.js 18+
- An ElevenLabs account (API key required for TTS)

### 1. Clone the repo

```bash
git clone https://github.com/jkennethedward-droid/kopiorder.git
cd kopiorder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` from the template:

```bash
# macOS / Linux
cp .env.local.example .env.local

# Windows (PowerShell)
Copy-Item .env.local.example .env.local
```

Open `.env.local` and add your own API key:

```bash
ELEVENLABS_API_KEY=your_key_here
```

Never commit `.env.local`. It is ignored by `.gitignore`.

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

Note: audio features work best over HTTPS. For mobile testing, deploy to Vercel or use a secure tunnel (e.g. ngrok).

---

## Deploying to Vercel

In the Vercel dashboard:

Settings → Environment Variables → Add

| Key | Value |
|---|---|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key |
| `NEXT_PUBLIC_SITE_URL` (optional) | `https://kopiorder.vercel.app` |

---

## Environment variables

| Variable | Required | Description |
|---|---:|---|
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key (server-side only via `pages/api/speak.ts`) |
| `NEXT_PUBLIC_SITE_URL` | No | Base URL used for Open Graph/Twitter meta tags |

See `.env.local.example` for the template. Never share or commit your actual key.

---

## Project structure

```
kopiorder/
├── pages/
│   ├── index.tsx              # App entry, manages phases and state
│   └── api/
│       └── speak.ts           # Edge Function: ElevenLabs TTS proxy
├── components/
│   ├── QuestionStep.tsx       # Animated single-question step
│   ├── DrinkTile.tsx          # Individual drink card on playback screen
│   ├── OrderPlayback.tsx      # Audio tiles + language toggle
│   └── EditFlow.tsx           # Edit view for a single drink
├── lib/
│   ├── types.ts               # Shared TypeScript types
│   ├── questions.ts           # Question and option definitions
│   ├── buildOrder.ts          # Phrase construction (SG + Mandarin)
│   └── time.ts                # (Optional) time utility
├── styles/
│   └── globals.css            # Global styles and CSS variables
├── public/
│   ├── og-image.png           # Social sharing preview image (1200x630)
│   └── favicon.png            # Favicon
├── scripts/
│   └── generate-og-image.mjs   # Generates placeholder OG/fav assets
├── .env.local.example         # Environment variable template
├── .gitignore
└── README.md
```

---

## How the voice output works

The app never calls ElevenLabs directly from the browser. All TTS requests go through a server-side Edge Function at `pages/api/speak.ts`, which keeps the API key off the client.

The Edge Function receives text + language mode, calls ElevenLabs, and streams the audio back as `audio/mpeg`.

If the ElevenLabs call fails (or returns empty audio), the app silently falls back to the browser’s built-in Web Speech API so the user still gets audio.

---

## Kopitiam lingo reference

| Term | Meaning |
|---|---|
| Kopi | Coffee with condensed milk |
| Teh | Tea with condensed milk |
| -O | No milk, black |
| -C | Evaporated (Carnation) milk instead |
| Siu Dai | Less sugar |
| Kosong | No sugar |
| Gah Dai | Extra sweet |
| Gau | Strong |
| Poh | Weak |
| Peng | Iced |
| Yuan Yang | Half coffee, half tea |

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b your-feature-name`
3. Make your changes
4. Push and open a pull request

Please do not commit `.env.local` or any API keys. Ever.

---

## License

MIT.
