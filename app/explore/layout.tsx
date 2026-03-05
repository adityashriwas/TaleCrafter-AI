import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Explore Stories",
  description:
    "Explore AI-generated stories from the TaleCrafter community across genres, styles, and age groups.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: "Explore AI Stories",
    description: "Browse AI generated illustrated stories created by users.",
    url: "/explore",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "Explore AI Stories",
    description: "Browse AI generated illustrated stories created by users.",
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
