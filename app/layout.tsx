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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-[#F5ECE4] via-[#FFF8F2] to-[#DDF4DE] dark:from-[#2A1711] dark:via-[#1F120D] dark:to-[#233326]`}
      >
        {children}
      </body>
    </html>
  );
}
