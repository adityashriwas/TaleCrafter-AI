import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "TaleCrafter AI admin management panel.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/admin",
  },
  openGraph: {
    title: "Admin Panel",
    description: "TaleCrafter AI admin management panel.",
    url: "/admin",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
