import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kopiorder.vercel.app";
  const ogImageUrl = `${siteUrl}/og-image.png`;
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Order kopi like a local." />

        <meta property="og:title" content="KopiOrder" />
        <meta property="og:description" content="Order kopi like a local." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="KopiOrder" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KopiOrder" />
        <meta name="twitter:description" content="Order kopi like a local." />
        <meta name="twitter:image" content={ogImageUrl} />

        <meta name="theme-color" content="#0f0e0c" />
        <meta name="apple-mobile-web-app-title" content="KopiOrder" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" href="/favicon.ico" />
        {/* Replace /public/og-image.png with a designed image (1200x630, dark bg + amber KopiOrder text). */}

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
