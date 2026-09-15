import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Bedtime Story Generator for Kids",
  description:
    "Create calming bedtime stories with AI for kids and families. Generate illustrated bedtime storybooks with gentle tones, visuals, and narration.",
  keywords: [
    "AI bedtime story generator",
    "bedtime story generator for kids",
    "kids bedtime story AI",
    "personalized bedtime stories",
    "AI children story generator",
    "bedtime stories with pictures",
  ],
  alternates: {
    canonical: "/ai-bedtime-story-generator",
  },
  openGraph: {
    title: "AI Bedtime Story Generator for Kids",
    description:
      "Generate bedtime stories with AI, pictures, and narration for a soothing reading routine.",
    url: "/ai-bedtime-story-generator",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "AI Bedtime Story Generator for Kids",
    description:
      "Generate bedtime stories with AI, pictures, and narration for a soothing reading routine.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AIBedtimeStoryGeneratorPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b1f] px-6 py-12 text-blue-100 md:px-12 lg:px-24">
      <div className="tc-hero-grid absolute inset-0 opacity-30" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative mx-auto max-w-5xl">
        <section className="tc-glass-panel p-6 md:p-10">
          <h1 className="tc-title-gradient text-3xl font-extrabold md:text-5xl">
            AI Bedtime Story Generator
          </h1>
          <p className="mt-5 text-base leading-relaxed text-blue-100/80 md:text-lg">
            Create personalized bedtime stories in seconds with TaleCrafter AI. Build calming,
            age-appropriate stories with gentle pacing, comforting tone, and story illustrations
            that keep nighttime reading fun and simple.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/create-story" className="tc-btn-primary px-5 py-2 text-sm" prefetch={true}>
              Create Bedtime Story
            </Link>
            <Link href="/explore" className="tc-btn-ghost px-5 py-2 text-sm" prefetch={true}>
              Read Story Examples
            </Link>
          </div>
        </section>

        <section className="tc-glass-panel-soft mt-8 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">Why Families Use It</h2>
          <ul className="mt-4 grid gap-3 text-sm text-blue-100/80 md:grid-cols-2 md:text-base">
            <li>Personalized bedtime stories with names and themes</li>
            <li>Age-appropriate language for toddlers and children</li>
            <li>Calm, positive storytelling for nightly routines</li>
            <li>Beautiful visual story pages generated automatically</li>
            <li>Text-to-speech narration for shared listening</li>
            <li>Save and revisit stories anytime from your library</li>
          </ul>
        </section>

        <section className="tc-glass-panel-soft mt-8 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">How to Create Bedtime Stories</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-blue-100/80 md:text-base">
            <li>Enter a child-friendly theme or character.</li>
            <li>Select age category and preferred visual style.</li>
            <li>Generate story and cover image instantly.</li>
            <li>Read aloud, use narration, or export for later bedtime use.</li>
          </ol>
        </section>

        <section className="tc-glass-panel-soft mt-8 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-blue-100/80 md:text-base">
            <div>
              <h3 className="font-semibold text-white">Is this suitable for young kids?</h3>
              <p className="mt-1">Yes. You can choose age categories to keep story tone and content appropriate.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I generate new bedtime stories every night?</h3>
              <p className="mt-1">Yes. You can create unlimited variety by changing prompt, style, and story type.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I share bedtime stories with family?</h3>
              <p className="mt-1">Yes. Story pages support sharing links so family members can read from any device.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
