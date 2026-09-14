import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import Script from "next/script";
import { connection } from "next/server";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { BottomAdBanner } from "@/components/BottomAdBanner";
import { CommandPalette } from "@/components/CommandPalette";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.leetmap-pro.com'),
  applicationName: 'LeetMap Pro',
  appleWebApp: {
    title: 'LeetMap Pro',
    capable: true,
    statusBarStyle: 'default',
  },
  title: {
    default: 'LeetMap Pro | Company-Wise LeetCode & SQL Questions',
    template: '%s | LeetMap Pro',
  },
  description: 'Practice verified company-wise LeetCode and SQL interview questions from 680+ top tech firms (Google, Meta, Amazon, Microsoft, Apple), ranked by frequency and 30-day recency. 100% free alternative to LeetCode Premium.',
  keywords: [
    'leetmap',
    'LeetMap',
    'leetmap pro',
    'leetmappro',
    'free leetcode company questions',
    'LeetCode Company Wise',
    'company wise leetcode questions 2026',
    'leetcode premium free alternative',
    'LeetCode Questions by Company',
    'LeetCode Frequency',
    'leetcode frequency list 2026',
    'Coding Interview Preparation',
    'FAANG Interview Questions',
    'LeetCode Patterns',
    'SQL Interview Questions',
    'company wise sql questions',
    'Technical Interview Roadmap',
    'blind 75',
    'neetcode 150',
    'grind 75',
    'leetcode sql',
    'sql leetcode',
    'leetcode sql 50',
    'sql 50 leetcode',
  ],
  authors: [{ name: 'LeetMap Pro' }],
  creator: 'LeetMap Pro',
  publisher: 'LeetMap Pro',
  category: 'education',
  classification: 'Software Engineering Coding Interview Preparation & LeetCode Roadmaps',
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: 'https://www.leetmap-pro.com/feed.xml', title: 'LeetMap Pro RSS Feed' }],
      'application/atom+xml': [{ url: 'https://www.leetmap-pro.com/feed.xml?format=atom', title: 'LeetMap Pro Atom Feed' }],
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.leetmap-pro.com',
    siteName: 'LeetMap Pro',
    title: 'LeetMap Pro | Company-Wise LeetCode & SQL Questions',
    description: 'Browse coding interview problems actually asked by 680+ tech companies, ranked by frequency and recency. Free interactive strategy roadmap and curated SQL problems.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'LeetMap Pro Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@saitarrun',
    creator: '@saitarrun',
    title: 'LeetMap Pro | Company-Wise LeetCode & SQL Questions',
    description: 'Browse coding interview problems actually asked by 680+ tech companies, ranked by frequency and recency.',
    images: ['/icon-512.png'],
  },
  verification: {
    google: 'zQTd5IdhklFb7tgLr2_5ixhggoG5rfAD-NnMdoJ4Ijk',
    other: {
      'msvalidate.01': '3197E69BB7A94B4BD584F66EB2436C2C',
      'google-adsense-account': 'ca-pub-5930264634833391',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48 32x32 16x16', type: 'image/x-icon' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LeetMap Pro',
    alternateName: ['LeetMap', 'LeetMapPro', 'leetmap-pro.com'],
    url: 'https://www.leetmap-pro.com',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.leetmap-pro.com/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LeetMap Pro',
    url: 'https://www.leetmap-pro.com',
    logo: 'https://www.leetmap-pro.com/icon-192.png',
    image: 'https://www.leetmap-pro.com/icon-512.png',
    sameAs: [
      'https://github.com/saitarrun/LeetMap-Pro',
    ],
  },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="zQTd5IdhklFb7tgLr2_5ixhggoG5rfAD-NnMdoJ4Ijk" />
        <meta name="application-name" content="LeetMap Pro" />
        <meta name="apple-mobile-web-app-title" content="LeetMap Pro" />
        <meta property="og:site_name" content="LeetMap Pro" />
        <link rel="icon" type="image/png" sizes="192x192" href="https://www.leetmap-pro.com/icon-192.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="https://www.leetmap-pro.com/icon-48.png" />
        <link rel="icon" type="image/x-icon" href="https://www.leetmap-pro.com/favicon.ico" sizes="48x48 32x32 16x16" />
        <link rel="shortcut icon" href="https://www.leetmap-pro.com/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://www.leetmap-pro.com/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="LeetMap Pro | Latest Interview Questions & Daily Challenges" href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title="LeetMap Pro Atom Feed" href="/feed.xml?format=atom" />
        <link rel="author" href="/humans.txt" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.clerk.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
        <link rel="dns-prefetch" href="https://tpc.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://img.clerk.com" />
        <meta name="google-adsense-account" content="ca-pub-5930264634833391" />
        <Script
          id="google-adsense"
          strategy="lazyOnload"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5930264634833391"
          crossOrigin="anonymous"
          nonce={nonce}
        />
        <Script src="/theme-init.js" strategy="beforeInteractive" nonce={nonce} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-[var(--text-main)]/15 selection:text-[var(--text-main)]">
        <ClerkProvider
          dynamic
          nonce={nonce}
          appearance={{
            options: {
              unsafe_disableDevelopmentModeWarnings: true,
            },
          }}
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
              <BottomAdBanner />
              <Footer />
            </div>
            <CommandPalette />
          </AuthProvider>
          <Toaster position="bottom-right" richColors closeButton />
        </ClerkProvider>
      </body>
    </html>
  );
}
