import type { Metadata } from "next";
import "./globals.css";
import Provider from "./Provider";
import Header from "./(components)/Header";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "./(components)/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next"

const myAppFont = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaleCrafter AI - AI Storyteller and Generator | Create Engaging Stories with AI",
  description:
    "TaleCrafter AI is an AI-powered storytelling platform that lets you create unique, engaging stories with text-to-speech, animated visuals, and recommendations. Perfect for writers, educators, and storytellers!",
  keywords: [
    "AI story generator",
    "AI-powered storytelling",
    "Create stories with AI",
    "Animated storybook",
    "Text-to-speech story generator",
    "AI writing tool",
  ],
  openGraph: {
    title: "TaleCrafter AI - AI Story Generator",
    description:
      "Generate AI-written stories with stunning visuals and immersive text-to-speech narration. Bring your imagination to life with TaleCrafter AI!",
    url: "https://www.talecrafter.tech/",
    siteName: "TaleCrafter AI",
    images: [
      {
        url: "/https://github.com/adityashriwas/TaleCrafter-AI/blob/main/Screenshot.png",
        alt: "TaleCrafter AI - AI Story Generator",
      },
    ],
    type: "website",
  },
  twitter:{
    title: "TaleCrafter AI - AI Story Generator",
    description:
      "Generate AI-written stories with stunning visuals and immersive text-to-speech narration. Bring your imagination to life with TaleCrafter AI!",
    card: "summary_large_image",
    images: [
      {
        url: "/https://github.com/adityashriwas/TaleCrafter-AI/blob/main/Screenshot.png",
        alt: "TaleCrafter AI - AI Storyteller and Generator",
      },
    ],
    creator: "Aditya Shriwas",
  }
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
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-59BYFVQQML"></script>
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