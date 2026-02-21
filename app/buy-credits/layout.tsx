import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Credits",
  description: "Purchase TaleCrafter AI credits.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BuyCreditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
