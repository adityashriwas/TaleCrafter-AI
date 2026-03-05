import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About TaleCrafter AI",
  description:
    "Learn how TaleCrafter AI helps creators and educators generate high-quality storybooks with AI writing, dual reading modes, smart narration controls, and image-rich PDF export.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About TaleCrafter AI",
    description:
      "Learn how TaleCrafter AI helps creators and educators generate high-quality storybooks with AI writing and illustration.",
    url: "/about",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "About TaleCrafter AI",
    description: "Learn what TaleCrafter AI offers for AI storybook creation.",
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
