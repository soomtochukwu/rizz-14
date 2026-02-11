import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rizz-14 💘 | The Valentine's Digital Wingman",
  description:
    "The cheekiest way to shoot your shot. Generate a link, send it to your crush, and find out if they feel the same way!",
  openGraph: {
    title: "Rizz-14 💘",
    description: "Someone has a crush on you... Will you say YES?",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizz-14 💘",
    description: "Someone has a crush on you... Will you say YES?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased h-screen flex flex-col overflow-hidden`}>
        <Providers>
          <main className="grow flex items-center justify-center w-full relative z-10 overflow-y-auto">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
