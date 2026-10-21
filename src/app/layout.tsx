import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Topup Center — বাংলাদেশের #১ গেম টপআপ মার্কেটপ্লেস",
    template: "%s | Topup Center",
  },
  description:
    "Free Fire, PUBG UC, Clash of Clans, Mobile Legends ও আরও অনেক গেমের সবচেয়ে কম দামে ডায়মন্ড, UC ও গেম কয়েন কিনুন। bKash, Nagad, Rocket পেমেন্ট সাপোর্ট।",
  keywords: [
    "game topup",
    "free fire diamond",
    "pubg uc",
    "clash of clans gems",
    "mobile legends diamonds",
    "bkash topup",
    "bangladesh game",
    "গেম টপআপ",
    "ফ্রি ফায়ার ডায়মন্ড",
    "পাবজি ইউসি",
  ],
  authors: [{ name: "Topup Center" }],
  creator: "Topup Center",
  publisher: "Topup Center",
  metadataBase: new URL(
    process.env.APP_URL || "https://topupcenter.com.bd"
  ),
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: "en_US",
    siteName: "Topup Center",
    title: "Topup Center — বাংলাদেশের #১ গেম টপআপ মার্কেটপ্লেস",
    description:
      "সবচেয়ে কম দামে গেম টপআপ। সেকেন্ডে ডেলিভারি।",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Topup Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Topup Center — গেম টপআপ মার্কেটপ্লেস",
    description: "সবচেয়ে কম দামে গেম টপআপ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/favicon.ico",
    shortcut: "/brand/favicon-16x16.png",
    apple: "/brand/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#070A12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div className="animated-mesh" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
