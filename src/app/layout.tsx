import { Inter } from "next/font/google";
import "./globals.css";
import { TeeProvider } from "@/context/TeeContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"]});

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