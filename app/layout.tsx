import type { Metadata } from "next";
import "./globals.css";
import Provider from "./Provider";
import Header from "./(components)/Header";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "./(components)/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

const myAppFont = Nunito({ subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.talecrafterai.tech";
const ogImage = "/logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TaleCrafter AI | AI Story Generator for Digital Storybooks",
    template: "%s | TaleCrafter AI",
  },
  description:
    "Create illustrated storybooks with AI. TaleCrafter AI turns your prompts into engaging stories with visuals, narration support, and a smooth creation workflow.",
  applicationName: "TaleCrafter AI",
  keywords: [
    "AI story generator",
    "digital storybook creator",
    "AI storytelling app",
    "children story generator",
    "illustrated stories with AI",
    "text to story AI",
    "TaleCrafter AI",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "TaleCrafter AI | AI Story Generator for Digital Storybooks",
    description:
      "Turn prompts into illustrated storybooks with TaleCrafter AI. Generate stories, covers, and chapter content in minutes.",
    url: "/",
    siteName: "TaleCrafter AI",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "TaleCrafter AI",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaleCrafter AI | AI Story Generator for Digital Storybooks",
    description:
      "Create illustrated stories from prompts with TaleCrafter AI and publish engaging digital storybooks faster.",
    images: [ogImage],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Google Analytics script */}
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-59BYFVQQML"
          ></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-59BYFVQQML');
            `}
          </script>
        </head>
        <body className={myAppFont.className}>
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
