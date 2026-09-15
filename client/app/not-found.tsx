import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description:
    "The page you requested could not be found. Return to TaleCrafter AI to create and explore interactive AI stories.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: `404 - Page Not Found | ${SITE_NAME}`,
    description:
      "This page is unavailable. Visit TaleCrafter AI to generate interactive storybooks with AI.",
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `404 - Page Not Found | ${SITE_NAME}`,
    description:
      "This page is unavailable. Go back to TaleCrafter AI and continue your storytelling journey.",
  },
};

export default function NotFound() {
  return (
    <main className="tc-404-wrap">
      <div className="tc-404-bg-shape tc-404-bg-shape-one" aria-hidden="true" />
      <div className="tc-404-bg-shape tc-404-bg-shape-two" aria-hidden="true" />
      <div className="tc-404-noise" aria-hidden="true" />

      <section className="tc-404-card">
        <p className="tc-404-kicker">Page Lost In Story Space</p>

        <h1 className="tc-404-title">
          <span className="tc-404-title-number">4</span>
          <span className="tc-404-title-orb" aria-hidden="true">
            <span className="tc-404-orb-core" />
            <span className="tc-404-orb-ring" />
            <span className="tc-404-orb-ring tc-404-orb-ring-delay" />
          </span>
          <span className="tc-404-title-number">4</span>
        </h1>

        <p className="tc-404-copy">
          This chapter does not exist yet. Jump back to your library and start a new
          AI-crafted adventure.
        </p>

        <div className="tc-404-actions">
          <Link href="/" className="tc-404-btn tc-404-btn-primary">
            Back To Home
          </Link>
          <Link href="/explore" className="tc-404-btn tc-404-btn-ghost">
            Explore Stories
          </Link>
        </div>
      </section>
    </main>
  );
}
