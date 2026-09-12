import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import Script from "next/script";
import { connection } from "next/server";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
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
  metadataBase: new URL('https://leetmap-pro.vercel.app'),
  applicationName: 'LeetMap Pro',
  appleWebApp: {
    title: 'LeetMap Pro',
    capable: true,
    statusBarStyle: 'default',
  },
  title: {
    default: 'LeetMap Pro — Company Wise LeetCode & SQL Questions',
    template: '%s — LeetMap Pro',
  },
  description: 'Browse coding interview problems actually asked by 680+ tech companies, ranked by frequency and recency. Visual pattern roadmap, SQL interview questions, and real-time multi-source sync.',
  keywords: [
    'LeetCode Company Wise',
    'LeetCode Questions by Company',
    'LeetCode Frequency',
    'Coding Interview Preparation',
    'FAANG Interview Questions',
    'LeetCode Patterns',
    'SQL Interview Questions',
    'Technical Interview Roadmap',
  ],
  authors: [{ name: 'LeetMap Pro' }],
  creator: 'LeetMap Pro',
  publisher: 'LeetMap Pro',
  alternates: {
    canonical: '/',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://leetmap-pro.vercel.app',
    siteName: 'LeetMap Pro',
    title: 'LeetMap Pro — Company Wise LeetCode & SQL Questions',
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
    title: 'LeetMap Pro — Company Wise LeetCode & SQL Questions',
    description: 'Browse coding interview problems actually asked by 680+ tech companies, ranked by frequency and recency.',
    images: ['/icon-512.png'],
  },
  verification: {
    google: 'zQTd5IdhklFb7tgLr2_5ixhggoG5rfAD-NnMdoJ4Ijk',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48 32x32 16x16', type: 'image/x-icon' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
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
    alternateName: ['LeetMap', 'LeetMapPro', 'leetmap-pro.vercel.app'],
    url: 'https://leetmap-pro.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://leetmap-pro.vercel.app/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LeetMap Pro',
    url: 'https://leetmap-pro.vercel.app',
    logo: 'https://leetmap-pro.vercel.app/icon-192.png',
    image: 'https://leetmap-pro.vercel.app/icon-512.png',
    sameAs: [
      'https://github.com/saitarrun/LeetMap-Pro',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'LeetMap Pro',
    url: 'https://leetmap-pro.vercel.app',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    description: 'Browse coding interview problems actually asked by 680+ tech companies, ranked by frequency and recency. Free interactive strategy roadmap and curated SQL problems.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
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
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="48x48 32x32 16x16" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
