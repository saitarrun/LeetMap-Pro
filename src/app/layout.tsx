import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import Script from "next/script";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeetMap Pro — Company Wise LeetCode & SQL Questions",
  description: "Browse coding interview problems actually asked by 680+ tech companies, ranked by frequency and recency. Free, realtime multi-source sync.",
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
