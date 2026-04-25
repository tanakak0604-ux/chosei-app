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
  title: "日程調整",
  description: "かんたん日程調整アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '20px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
        }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.15em', color: '#B0A99F', textTransform: 'uppercase', transform: 'translateY(5px)' }}>
            Created by
          </span>
          <a href="https://andto.jp/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', transform: 'translateY(4px)' }}>
            <img src="/logo.png" alt="and to" style={{ width: '40px', display: 'block', opacity: 0.5 }} />
          </a>
        </div>
      </body>
    </html>
  );
}
