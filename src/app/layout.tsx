import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TeeProvider } from "@/context/TeeContext";

const inter = Inter({ subsets: ["latin"]});

export default function RootLayout({ 
  children,
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <TeeProvider>
          {children}
        </TeeProvider>
      </body>
    </html>
  );
}