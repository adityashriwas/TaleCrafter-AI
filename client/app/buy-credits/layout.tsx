import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Buy Credits",
  description: "Purchase TaleCrafter AI credits.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/buy-credits",
  },
  openGraph: {
    title: "Buy Credits",
    description: "Purchase TaleCrafter AI credits.",
    url: "/buy-credits",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function BuyCreditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
