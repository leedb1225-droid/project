import type { Metadata } from "next";
import Link from 'next/link';
import "./globals.css";
import { Providers } from '../components/Providers';
import HeaderNav from '../components/HeaderNav';

export const metadata: Metadata = {
  title: "온라인 포춘쿠키 - 마음을 전하는 행운 메시지",
  description: "직접 적은 행운과 응원의 한마디를 포춘쿠키에 담아 선물해보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>
          {/* Header Navigation */}
          <header className="sticky top-0 z-40 w-full bg-white/30 dark:bg-zinc-900/20 backdrop-blur-md border-b border-pink-200/30">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">🥠</span>
                <span className="font-black text-base tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  온라인 포춘쿠키
                </span>
              </Link>
              
              <HeaderNav />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Footer */}
          <footer className="w-full border-t border-pink-200/20 bg-white/20 dark:bg-zinc-900/10 py-8 px-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span>🥠</span>
                <span className="font-extrabold text-amber-500/80">온라인 포춘쿠키</span>
              </div>
              <div>
                © {new Date().getFullYear()} 온라인 포춘쿠키. All rights reserved.
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
