import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, toAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Review the Terms and Conditions for using TaleCrafter AI, including account rules, credits, content rights, and service limitations.",
  keywords: [
    "TaleCrafter AI terms",
    "AI story app terms and conditions",
    "usage policy",
    "content rights AI stories",
  ],
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: `Terms & Conditions | ${SITE_NAME}`,
    description:
      "Understand the legal terms for using TaleCrafter AI story generation and related services.",
    url: toAbsoluteUrl("/terms-and-conditions"),
    siteName: SITE_NAME,
    type: "article",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "TaleCrafter AI Terms and Conditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms & Conditions | ${SITE_NAME}`,
    description:
      "Read TaleCrafter AI terms covering accounts, credits, content rights, and prohibited use.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const lastUpdated = "March 8, 2026";

export default function TermsAndConditionsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-6 py-12 text-blue-100 md:px-12 lg:px-24">
      <div className="tc-hero-grid absolute inset-0 opacity-30" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative mx-auto max-w-5xl space-y-6">
        <section className="tc-glass-panel p-6 md:p-10">
          <h1 className="tc-title-gradient text-3xl font-extrabold md:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-sm text-blue-100/75 md:text-base">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
            By accessing or using TaleCrafter AI, you agree to these Terms &
            Conditions. If you do not agree, please do not use our services.
          </p>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Service overview</h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
            TaleCrafter AI provides tools to generate written stories, chapter
            illustrations, narrated reading experiences, and downloadable story
            formats. Features may change as we improve the platform.
          </p>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Accounts and eligibility</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-blue-100/80 md:text-base">
            <li>You are responsible for maintaining account security.</li>
            <li>You must provide accurate registration and billing details.</li>
            <li>You may not use the platform for unlawful or harmful content.</li>
          </ul>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Credits, payments, and refunds</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-blue-100/80 md:text-base">
            <li>Certain features require paid credits or subscriptions.</li>
            <li>Pricing may change and will be shown before purchase.</li>
            <li>Refund decisions are handled case-by-case unless required by law.</li>
            <li>Chargebacks or payment abuse may lead to account restrictions.</li>
          </ul>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Content rights and responsibility</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-blue-100/80 md:text-base">
            <li>
              You retain rights to prompts and eligible outputs you create,
              subject to these terms and third-party provider rules.
            </li>
            <li>
              You must not upload content that infringes copyright, privacy, or
              other legal rights.
            </li>
            <li>
              AI outputs may be imperfect; you are responsible for reviewing
              generated content before publishing or sharing.
            </li>
          </ul>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Prohibited use</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-blue-100/80 md:text-base">
            <li>No attempts to exploit, reverse engineer, or disrupt the service.</li>
            <li>No generation of illegal, abusive, or deceptive content.</li>
            <li>No automated scraping that harms performance or availability.</li>
          </ul>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Limitation of liability</h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
            The service is provided "as is" without warranties of uninterrupted
            operation or perfect output quality. To the maximum extent allowed by
            law, TaleCrafter AI is not liable for indirect or consequential
            damages arising from platform use.
          </p>
        </section>

        <section className="tc-glass-panel-soft rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-white">Contact</h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
            Questions about these terms can be sent to contact@talecrafterai.tech.
          </p>
        </section>
      </div>
    </div>
  );
}
