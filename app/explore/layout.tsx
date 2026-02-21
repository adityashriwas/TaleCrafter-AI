import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Stories",
  description:
    "Explore AI-generated stories from the TaleCrafter community across genres, styles, and age groups.",
  alternates: {
    canonical: "/explore",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
