import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import Script from "next/script";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://leetmap-pro.vercel.app'),
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeetMap Pro — Company Wise LeetCode & SQL Questions',
    description: 'Browse coding interview problems actually asked by 680+ tech companies, ranked by frequency and recency.',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

const jsonLd = {
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
};

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
            {children}
          </AuthProvider>
          <Toaster position="bottom-right" richColors closeButton />
        </ClerkProvider>
      </body>
    </html>
  );
}
