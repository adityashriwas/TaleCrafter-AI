import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://talecrafterai.tech";
export const SITE_NAME = "TaleCrafter AI";
export const DEFAULT_OG_IMAGE = "/logo.png";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Interactive AI Story Generator with Images | TaleCrafter AI",
    template: "%s | TaleCrafter AI",
  },
  description:
    "Generate interactive AI stories with images, narration, and branching paths. Create bedtime stories, kids stories, and visual storybooks in seconds.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: "Create interactive AI stories with pictures, narration, and branching choices.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "TaleCrafter AI Open Graph Cover",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Interactive AI story generator with images and narration.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const toAbsoluteUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
};
