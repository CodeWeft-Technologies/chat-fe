import type { Metadata } from "next";
import AppShell from "./components/app-shell";
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
  title: "Codeweft Chatbot",
  description: "powerful chatbot for your website",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/cw.png", type: "image/png" }
    ],
    apple: "/cw.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
