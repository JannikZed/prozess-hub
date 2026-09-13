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
  title: "Prozess-Hub · AgroHub GmbH",
  description:
    "Innendienst-Cockpit-Prototyp für Prozesssteuerung, Konversation und ERP-Entwürfe (Demo, kein Backend).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
