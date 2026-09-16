import type { Metadata } from "next";
import "./globals.css";
import Provider from "./Provider";
import Header from "./(components)/Header";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "./(components)/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { defaultMetadata } from "@/lib/seo";
import Script from "next/script";
import { Inter, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  ...defaultMetadata,
  applicationName: "TaleCrafter AI",
  keywords: [
    "interactive AI story generator",
    "AI story generator with pictures",
    "AI bedtime story generator",
    "kids story generator AI",
    "choose your own adventure AI",
    "image to story generator",
    "AI storybook creator",
    "text to story AI",
    "TaleCrafter AI",
  ],
  verification: {
    google: "TakfO_eWsWovc-6XhLw_0jxwFjgWgEBe9OMPyNE3ZEQ",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
        <head>
          <meta
            name="google-adsense-account"
            content="ca-pub-7599754297123102"
          />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-YC3YMYEXB2"
            strategy="afterInteractive"
          />
          <Script id="ga-yc3ymyexb2" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YC3YMYEXB2');`}
          </Script>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-K162WHSTLM"
            strategy="afterInteractive"
          />
          <Script id="ga-k162whstlm" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-K162WHSTLM');`}
          </Script>
          <Script
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7599754297123102"
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        </head>
        <body className={inter.className}>
          <Provider>
            <Header />
            {children}
            <SpeedInsights />
            <Footer />
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
