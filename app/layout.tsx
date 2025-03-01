import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Provider from "./Provider";
import Header from "./(components)/Header";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const myAppFont = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "TaleCrafter AI",
  description: "Create stories with TaleCrafter AI.",
=======
  title: "TaleCrafter AI - AI Story Generator | Create Engaging Stories with AI",
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
    url: "https://talecrafter-ai.vercel.app/",
    siteName: "TaleCrafter AI",
    images: [
      {
        url: "/Screenshot.png",
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
        url: "/Screenshot.png",
        alt: "TaleCrafter AI - AI Story Generator",
      },
    ],
    creator: "Aditya Shriwas",
  }
>>>>>>> responsive
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={myAppFont.className}>
          <Provider>
            <Header />
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}