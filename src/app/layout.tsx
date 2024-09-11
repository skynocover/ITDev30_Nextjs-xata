import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "My Website",
    template: "%s | My Website",
  },
  description: "Welcome to my awesome website",
  keywords: ["Next.js", "React", "JavaScript"],
  authors: [{ name: "John" }],
  creator: "John",
  publisher: "John",
  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={inter.className}>
          <main className="flex-grow container ">{children}</main>
        </body>
      </SessionProvider>
    </html>
  );
}
