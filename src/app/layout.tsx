import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { AlarmWatcher } from "@/components/AlarmWatcher";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "할 일 / 살 것 / 낼 돈",
  description: "Todo, To Buy, To Pay를 하나로 관리하는 빠른 체크리스트 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TodoCL",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden bg-white dark:bg-neutral-950">
        <header className="shrink-0 border-b border-neutral-100 px-4 py-3 dark:border-neutral-900">
          <h1 className="text-base font-bold">할 일 · 살 것 · 낼 돈</h1>
        </header>
        <NotificationPermissionBanner />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <BottomNav />
        <AlarmWatcher />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
