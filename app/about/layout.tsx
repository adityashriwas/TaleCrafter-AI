import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how TaleCrafter AI helps creators and educators generate high-quality storybooks with AI writing, dual reading modes, smart narration controls, and image-rich PDF export.",
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
