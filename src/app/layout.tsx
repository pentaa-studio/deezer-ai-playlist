import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Melo - Ton agent IA qui te crée des playlists Deezer sur mesure",
  description: "Melo est ton assistant IA musical personnel qui crée des playlists Deezer parfaitement adaptées à tes goûts. Discute avec Melo et obtiens des sélections musicales sur mesure en quelques secondes.",
  keywords: [
    "playlist", "musique", "IA", "intelligence artificielle", "Deezer", 
    "génération automatique", "personnalisé", "streaming", "découverte musicale",
    "playlist generator", "AI music", "music recommendation", "Melo", "agent musical"
  ],
  authors: [{ name: "Melo - Assistant IA Musical" }],
  creator: "Melo - Assistant IA Musical",
  publisher: "Melo - Assistant IA Musical",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://deezer-ai-playlist.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Melo - Ton agent IA qui te crée des playlists Deezer sur mesure",
    description: "Melo est ton assistant IA musical personnel qui crée des playlists Deezer parfaitement adaptées à tes goûts. Discute avec Melo et obtiens des sélections musicales sur mesure en quelques secondes.",
    url: '/',
    siteName: 'Melo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Melo - Ton agent IA qui te crée des playlists Deezer sur mesure',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Melo - Ton agent IA qui te crée des playlists Deezer sur mesure",
    description: "Melo est ton assistant IA musical personnel qui crée des playlists Deezer parfaitement adaptées à tes goûts. Discute avec Melo et obtiens des sélections musicales sur mesure.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a238ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Melo" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
