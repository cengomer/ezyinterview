import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientRoot from "./components/ClientRoot";
import Script from "next/script";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* LemonSqueezy JS SDK */}
        {/* ...other head tags if any... */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 min-h-screen flex flex-col`}
      >
        <ClientRoot>
          <div className="flex-grow">
            {children}
          </div>
          <footer className="py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-sm text-gray-500">
                <Link href="/terms-of-service" className="hover:text-gray-700">
                  Terms of Service
                </Link>
                <span className="mx-2">•</span>
                <span>© {new Date().getFullYear()} EZY Interview. All rights reserved.</span>
              </div>
            </div>
          </footer>
        </ClientRoot>
      </body>
    </html>
  );
}
