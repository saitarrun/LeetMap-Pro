import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrindMap Pro — Company Wise LeetCode Questions",
  description: "Browse coding interview problems actually asked by 470+ tech companies, ranked by frequency and recency. Free, realtime sync.",
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
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-blue-500/20 selection:text-blue-500">
        {children}
      </body>
    </html>
  );
}
