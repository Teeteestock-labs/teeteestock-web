import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TeeProvider } from "@/context/TeeContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "TeeTeeStock - VTuber 虛擬股票交易所",
  description: "VTuber 虛擬股票交易所",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/teeteeStock.jpeg", type: "image/jpeg" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ 
  children,
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <AuthProvider>
          <TeeProvider>
            {children}
          </TeeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}