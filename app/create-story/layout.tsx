import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Interactive Story",
  description: "Generate branching interactive stories with choice-driven plot paths in TaleCrafter AI.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function CreateStoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
