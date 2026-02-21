import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how TaleCrafter AI helps creators and educators generate high-quality storybooks with AI writing, visuals, and narration-ready pages.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
