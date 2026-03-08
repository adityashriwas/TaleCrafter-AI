import type { Metadata } from "next";
import Feedback from "../(components)/Feedback";
import { DEFAULT_OG_IMAGE, SITE_NAME, toAbsoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact TaleCrafter AI Support",
  description:
    "Contact TaleCrafter AI for support, account help, billing questions, bug reports, and partnership inquiries.",
  keywords: [
    "TaleCrafter AI contact",
    "AI story generator support",
    "TaleCrafter help",
    "report AI story bug",
    "AI story app contact",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact | ${SITE_NAME}`,
    description:
      "Reach TaleCrafter AI support for product issues, billing questions, and collaboration requests.",
    url: toAbsoluteUrl("/contact"),
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Contact TaleCrafter AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact | ${SITE_NAME}`,
    description:
      "Need help with TaleCrafter AI? Contact support for account, story generation, and billing assistance.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const contactCards = [
  {
    title: "General Support",
    detail: "Need help creating or managing stories? Education, publishing, or brand collaboration inquiries.",
    value: "contact@talecrafterai.tech",
    href: "mailto:contact@talecrafterai.tech",
  },
//   {
//     title: "Billing & Credits",
//     detail: "Questions about plans, purchases, or usage credits.",
//     value: "billing@talecrafterai.tech",
//     href: "mailto:billing@talecrafterai.tech",
//   },
//   {
//     title: "Partnerships",
//     detail: "Education, publishing, or brand collaboration inquiries.",
//     value: "partners@talecrafterai.tech",
//     href: "mailto:partners@talecrafterai.tech",
//   },
];

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-6 py-12 text-blue-100 md:px-12 lg:px-24">
      <div className="tc-hero-grid absolute inset-0 opacity-30" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative mx-auto max-w-6xl">
        <section className="tc-glass-panel p-6 text-center shadow-[0_15px_45px_rgba(0,0,0,0.35)] md:p-10">
          <h1 className="tc-title-gradient text-3xl font-extrabold md:text-5xl">
            Contact TaleCrafter AI
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-blue-100/75 md:text-lg">
            Share feedback, report issues, or ask product questions. We usually
            reply within 1 to 2 business days.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {contactCards.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="tc-glass-panel-soft rounded-xl p-5 transition hover:bg-blue-500/10"
            >
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-blue-100/75">{item.detail}</p>
              <p className="mt-3 text-sm font-medium text-cyan-200">{item.value}</p>
            </a>
          ))}
        </section>

        <section className="tc-glass-panel-soft mt-8 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white">Send us a message</h2>
          <p className="mt-2 text-sm leading-relaxed text-blue-100/75 md:text-base">
            This is the same feedback form previously shown in the footer, now
            moved here for a cleaner site layout and better support workflow.
          </p>
          <div className="mt-5">
            <Feedback />
          </div>
        </section>

        <section className="tc-glass-panel-soft mt-8 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white">Before you contact us</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-blue-100/80 md:text-base">
            <li>For story quality issues, include your prompt and selected genre.</li>
            <li>For image issues, include the story title and chapter number.</li>
            <li>For billing issues, share the purchase email used at checkout.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
