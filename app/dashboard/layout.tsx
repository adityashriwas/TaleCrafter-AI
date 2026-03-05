import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your stories and activity in TaleCrafter AI.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/dashboard",
  },
  openGraph: {
    title: "Dashboard",
    description: "Manage your stories and activity in TaleCrafter AI.",
    url: "/dashboard",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
