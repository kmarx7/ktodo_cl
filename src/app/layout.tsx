import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderBar } from "@/components/HeaderBar";
import { AlarmWatcher } from "@/components/AlarmWatcher";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { UndoToast } from "@/components/UndoToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TodoCL — To Do, To Pay, To Buy, To Think",
  description: "A fast checklist app for To Do, To Pay, To Buy, and To Think",
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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden overscroll-none bg-white dark:bg-neutral-950">
        <HeaderBar />
        <NotificationPermissionBanner />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <UndoToast />
        <AlarmWatcher />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
