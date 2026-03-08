import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, toAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how TaleCrafter AI collects, uses, stores, and protects personal data across stories, images, accounts, and support workflows.",
  keywords: [
    "TaleCrafter AI privacy policy",
    "AI story generator privacy",
    "data use policy",
    "user data protection",
  ],
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "Understand TaleCrafter AI data practices for account info, prompts, generated stories, and support requests.",
    url: toAbsoluteUrl("/privacy-policy"),
    siteName: SITE_NAME,
    type: "article",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "TaleCrafter AI Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "Read TaleCrafter AI's privacy policy and how user data is handled across our platform.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const lastUpdated = "March 8, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-6 py-12 text-blue-100 md:px-12 lg:px-24">
      <div className="tc-hero-grid absolute inset-0 opacity-30" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative mx-auto max-w-5xl space-y-6">
        <section className="tc-glass-panel p-6 md:p-10">
          <h1 className="tc-title-gradient text-3xl font-extrabold md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-blue-100/75 md:text-base">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
            TaleCrafter AI ("we", "our", "us") provides AI story generation,
            image generation, narration, and account-based dashboard features.
            This Privacy Policy explains what information we collect and how we
            use it when you use our website and services.
          </p>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Information we collect</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-blue-100/80 md:text-base">
            <li>Account details such as name, email address, and profile image.</li>
            <li>Story inputs, prompts, genre choices, and uploaded images.</li>
            <li>Generated outputs including stories, chapter images, and slugs.</li>
            <li>Support messages submitted through our contact/feedback form.</li>
            <li>Usage and analytics data to improve performance and reliability.</li>
          </ul>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">How we use your data</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-blue-100/80 md:text-base">
            <li>To create, store, and display stories and related media.</li>
            <li>To process purchases and manage usage credits.</li>
            <li>To detect abuse, enforce policies, and protect the platform.</li>
            <li>To troubleshoot bugs and provide customer support.</li>
            <li>To improve product quality, speed, and model output relevance.</li>
          </ul>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Data sharing and providers</h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
            We may use trusted third-party services for authentication,
            infrastructure, analytics, payments, and AI processing. We do not
            sell your personal data. We share only data necessary for those
            services to operate securely and effectively.
          </p>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Retention and security</h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
            We retain data for as long as needed to provide the service, comply
            with legal obligations, and resolve disputes. We use reasonable
            technical and organizational safeguards, but no online system is
            completely secure.
          </p>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Your choices</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-blue-100/80 md:text-base">
            <li>You can request account data updates or deletion, where applicable.</li>
            <li>You can contact us about privacy concerns at contact@talecrafterai.tech.</li>
            <li>You can stop using the service at any time.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
