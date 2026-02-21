import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Story",
  description: "Generate a new story in TaleCrafter AI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreateStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
