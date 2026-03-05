import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create Story",
  description: "Generate branching interactive stories with choice-driven plot paths in TaleCrafter AI.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/create-story",
  },
  openGraph: {
    title: "Create Story",
    description: "Create illustrated AI storybooks from your prompts.",
    url: "/create-story",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "Create Story",
    description: "Create illustrated AI storybooks from your prompts.",
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
