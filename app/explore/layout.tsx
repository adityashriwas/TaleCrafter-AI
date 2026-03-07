import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Explore AI Stories and Storybooks",
  description:
    "Discover AI generated stories with pictures across fantasy, bedtime, adventure, and educational genres.",
  keywords: [
    "AI generated stories",
    "read AI stories",
    "AI bedtime stories",
    "fantasy AI stories",
    "interactive storybooks",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: "Explore AI Stories and Storybooks",
    description: "Browse community-created AI stories with images and genres.",
    url: "/explore",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "Explore AI Stories and Storybooks",
    description: "Browse community-created AI stories with images and genres.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
