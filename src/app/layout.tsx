import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeetMap — Company Wise LeetCode & SQL Questions",
  description: "Browse coding interview problems actually asked by 680+ tech companies, ranked by frequency and recency. Free, realtime multi-source sync.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-[var(--text-main)]/15 selection:text-[var(--text-main)]">
        <ClerkProvider
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
