import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About TaleCrafter AI",
  description:
    "Discover how TaleCrafter AI turns ideas and images into illustrated, narrated storybooks with classic narratives and choice-driven Plot Twist paths.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About TaleCrafter AI",
    description:
      "Explore the complete TaleCrafter AI workflow for illustrated stories, narration, and choice-driven Plot Twist paths.",
    url: "/about",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "About TaleCrafter AI",
    description:
      "Learn how TaleCrafter AI brings writing, illustration, narration, and branching story paths into one creative workflow.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
