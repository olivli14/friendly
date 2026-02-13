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
  title: "Quokka Bay — Discover Activities Near You",
  description:
    "Tell us your hobbies and zip code and we'll suggest personalized activities, events, and spots near you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950`}
      >
        {children}
      </body>
    </html>
  );
}
