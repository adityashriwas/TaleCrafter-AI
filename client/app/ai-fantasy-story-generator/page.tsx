import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Fantasy Story Generator with Images",
  description:
    "Generate fantasy stories with AI, complete with magical worlds, characters, visuals, and narration. Create illustrated fantasy storybooks in minutes.",
  keywords: [
    "AI fantasy story generator",
    "fantasy story generator AI",
    "AI story generator with images",
    "magic story generator",
    "dragon story generator",
    "fantasy storybook creator",
  ],
  alternates: {
    canonical: "/ai-fantasy-story-generator",
  },
  openGraph: {
    title: "AI Fantasy Story Generator with Images",
    description:
      "Create fantasy stories with AI, images, and narration for immersive reading.",
    url: "/ai-fantasy-story-generator",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: "AI Fantasy Story Generator with Images",
    description:
      "Create fantasy stories with AI, images, and narration for immersive reading.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AIFantasyStoryGeneratorPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b1f] px-6 py-12 text-blue-100 md:px-12 lg:px-24">
      <div className="tc-hero-grid absolute inset-0 opacity-30" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative mx-auto max-w-5xl">
        <section className="tc-glass-panel p-6 md:p-10">
          <h1 className="tc-title-gradient text-3xl font-extrabold md:text-5xl">
            AI Fantasy Story Generator
          </h1>
          <p className="mt-5 text-base leading-relaxed text-blue-100/80 md:text-lg">
            Build magical stories with AI, from dragon kingdoms and enchanted forests to heroes,
            quests, and plot twists. TaleCrafter AI helps you generate complete fantasy storybooks
            with visuals and narration from a single prompt.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/create-story" className="tc-btn-primary px-5 py-2 text-sm" prefetch={true}>
              Create Fantasy Story
            </Link>
            <Link href="/explore" className="tc-btn-ghost px-5 py-2 text-sm" prefetch={true}>
              Explore AI Stories
            </Link>
          </div>
        </section>

        <section className="tc-glass-panel-soft mt-8 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">What You Can Generate</h2>
          <ul className="mt-4 grid gap-3 text-sm text-blue-100/80 md:grid-cols-2 md:text-base">
            <li>Fantasy short stories and full chapter storybooks</li>
            <li>Age-adapted language for kids, teens, and adults</li>
            <li>Character-driven adventures with branching choices</li>
            <li>AI-generated story images in multiple art styles</li>
            <li>Narration-ready pages and PDF export support</li>
            <li>Instant shareable links for published stories</li>
          </ul>
        </section>

        <section className="tc-glass-panel-soft mt-8 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">How It Works</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-blue-100/80 md:text-base">
            <li>Describe your fantasy world, characters, or quest in one prompt.</li>
            <li>Select age group, story type, and image style.</li>
            <li>Generate your AI fantasy story with illustrations.</li>
            <li>Read in flipbook mode, listen with narration, or export as PDF.</li>
          </ol>
        </section>

        <section className="tc-glass-panel-soft mt-8 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">FAQ</h2>
          <div className="mt-4 space-y-4 text-sm text-blue-100/80 md:text-base">
            <div>
              <h3 className="font-semibold text-white">Can I create fantasy stories for children?</h3>
              <p className="mt-1">Yes. You can choose child-friendly age categories and keep output appropriate.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Does it generate fantasy images too?</h3>
              <p className="mt-1">Yes. Each chapter can include AI-generated visuals based on your story context.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I make interactive fantasy stories?</h3>
              <p className="mt-1">Yes. Use interactive mode to build choice-driven fantasy paths and alternate endings.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
