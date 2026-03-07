import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create AI Story with Images and Voice",
  description: "Create AI stories with pictures, narration, and branching plot choices. Generate kids stories, bedtime stories, and interactive storybooks instantly.",
  keywords: [
    "create AI story",
    "AI story generator with images",
    "interactive story generator",
    "bedtime story generator",
    "kids story generator",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/create-story",
  },
  openGraph: {
    title: "Create AI Story with Images and Voice",
    description: "Generate interactive AI stories with visuals, narration, and choices.",
    url: "/create-story",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "Create AI Story with Images and Voice",
    description: "Generate interactive AI stories with visuals, narration, and choices.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function CreateStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
