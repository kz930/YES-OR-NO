import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

// Inter handles latin/numerals; Chinese falls back to system PingFang/Microsoft YaHei.
// This stack mirrors apple.com (SF Pro on Apple devices, Inter elsewhere).
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "YES OR NO — 一道脑洞题,你站哪边?",
  description: "脑洞辩论投票 · 看观点 · 参与讨论的轻社区",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
