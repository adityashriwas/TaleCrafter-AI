"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Download,
  GitBranch,
  GraduationCap,
  ImageIcon,
  Languages,
  Mic2,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

const MotionDiv = motion.div;

const workflow = [
  {
    number: "01",
    title: "Start with an idea",
    description:
      "Describe the story you want to tell or upload an image as the creative starting point. Then choose the genre, reader age, and illustration style that fit your audience.",
  },
  {
    number: "02",
    title: "Build the story world",
    description:
      "TaleCrafter turns those choices into a structured narrative, cover, and illustrated pages. The writing and visual prompts are developed together so the finished book feels coherent.",
  },
  {
    number: "03",
    title: "Read it your way",
    description:
      "Open the finished work as a flipbook or a scrolling story, listen with page narration, and export an image-rich PDF when you need an offline copy.",
  },
];

const capabilities = [
  {
    icon: WandSparkles,
    title: "AI-assisted writing",
    description:
      "A complete narrative shaped around your subject, genre, age group, and creative direction.",
  },
  {
    icon: ImageIcon,
    title: "Illustrated pages",
    description:
      "A generated cover and scene imagery in visual styles ranging from watercolor to comics and 3D.",
  },
  {
    icon: GitBranch,
    title: "Plot Twist paths",
    description:
      "Choice-driven branches that let the reader decide what happens next and build a personal ending.",
  },
  {
    icon: Mic2,
    title: "Narrated reading",
    description:
      "Built-in page narration turns a visual storybook into a listening experience without leaving the reader.",
  },
  {
    icon: Languages,
    title: "Flexible storytelling",
    description:
      "Create for different genres, age groups, art directions, and languages from one focused workflow.",
  },
  {
    icon: Download,
    title: "Shareable output",
    description:
      "Keep stories in your dashboard, read them online, or export a polished PDF for offline sharing.",
  },
];

const audiences = [
  {
    icon: Sparkles,
    title: "Creators",
    description:
      "Move from a loose concept to a visual first draft quickly, then use the result to explore characters, scenes, and new directions.",
  },
  {
    icon: GraduationCap,
    title: "Educators and families",
    description:
      "Shape stories for a reader's age and interests, making reading sessions more personal, visual, and participatory.",
  },
  {
    icon: Users,
    title: "Teams and storytellers",
    description:
      "Create consistent story concepts for workshops, presentations, campaigns, and collaborative ideation without assembling several separate tools.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const About = () => {
  return (
    <main className="overflow-hidden bg-[#020b1f] text-blue-100">
      <section className="relative flex min-h-[72svh] items-end">
        <Image
          src="/fantasy.webp"
          alt="An open storybook unfolding into a fantasy world"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#020817]/75" />

        <MotionDiv
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.65 }}
          className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-32 sm:px-8 md:pb-20 lg:px-12"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
            About the platform
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            TaleCrafter AI
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-50/85 sm:text-xl">
            A creative workspace for turning a simple idea into an illustrated,
            narrated storybook, with classic narratives and Plot Twist paths
            that readers can shape as they go.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/create-story"
              className="tc-btn-primary inline-flex items-center gap-2 px-6 py-3"
            >
              Create a story
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/explore"
              className="tc-btn-ghost inline-flex items-center px-6 py-3"
            >
              Explore stories
            </Link>
          </div>
        </MotionDiv>
      </section>

      <section className="border-t border-blue-200/10 bg-[#071328] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.55 }}
          className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              Why TaleCrafter exists
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Story creation should feel imaginative, not fragmented.
            </h2>
          </div>
          <div className="space-y-6 text-base leading-8 text-blue-100/75 sm:text-lg">
            <p>
              Writing a story is only one part of making a book. There is also
              structure, illustration, pacing, reading, narration, and sharing.
              Moving between separate tools for each step can interrupt the
              creative process before an idea has room to grow.
            </p>
            <p>
              TaleCrafter brings those steps into one place. You provide the
              premise and creative boundaries; the platform helps transform them
              into a complete visual reading experience. It is designed to make
              starting easier while leaving the important decisions in your hands.
            </p>
          </div>
        </MotionDiv>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <MotionDiv
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="max-w-3xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              From prompt to storybook
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              One connected creative workflow
            </h2>
            <p className="mt-5 text-lg leading-8 text-blue-100/70">
              Each stage is designed to carry your original direction forward,
              so the story, artwork, and reading experience belong together.
            </p>
          </MotionDiv>

          <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div className="divide-y divide-blue-200/15 border-y border-blue-200/15">
              {workflow.map((step) => (
                <MotionDiv
                  key={step.number}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.35 }}
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="grid grid-cols-[3.5rem_1fr] gap-4 py-7 sm:grid-cols-[5rem_1fr]"
                >
                  <span className="text-sm font-bold text-cyan-300">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-7 text-blue-100/70">
                      {step.description}
                    </p>
                  </div>
                </MotionDiv>
              ))}
            </div>

            <MotionDiv
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-lg border border-blue-200/20 bg-white"
            >
              <Image
                src="/demo.png"
                alt="TaleCrafter story reader showing illustrated story pages"
                width={817}
                height={754}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full"
              />
            </MotionDiv>
          </div>
        </div>
      </section>

      <section className="border-y border-blue-200/10 bg-[#08172b] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <MotionDiv
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="grid gap-10 lg:grid-cols-2 lg:gap-20"
          >
            <div>
              <div className="flex items-center gap-3 text-cyan-200">
                <GitBranch className="h-6 w-6" aria-hidden="true" />
                <span className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Plot Twist mode
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
                The reader does more than turn the page.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-blue-100/75 sm:text-lg">
              <p>
                Plot Twist Stories pause at meaningful turning points and offer
                two possible directions. The selected choice becomes part of the
                story history, and TaleCrafter writes and illustrates the next
                branch around that decision.
              </p>
              <p>
                The path view keeps those decisions visible as the story grows.
                When the journey is ready to end, the chosen branches are compiled
                into a complete storybook with a final resolution.
              </p>
              <Link
                href="/create-story"
                className="inline-flex items-center gap-2 font-semibold text-cyan-200 transition hover:text-white"
              >
                Start a Plot Twist story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              What is included
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              More than generated text
            </h2>
          </div>

          <div className="mt-14 grid border-y border-blue-200/15 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <MotionDiv
                  key={item.title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  variants={fadeUp}
                  transition={{ delay: index * 0.04, duration: 0.45 }}
                  className="border-b border-blue-200/15 px-0 py-8 sm:px-7 lg:border-r lg:last:border-r-0"
                >
                  <Icon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-blue-100/70">
                    {item.description}
                  </p>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-200/10 bg-[#071328] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
                Made for many kinds of storytellers
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                A flexible tool for ideas that need a world around them.
              </h2>
            </div>
            <div className="divide-y divide-blue-200/15 border-y border-blue-200/15">
              {audiences.map((audience) => {
                const Icon = audience.icon;
                return (
                  <div
                    key={audience.title}
                    className="grid gap-4 py-7 sm:grid-cols-[2rem_10rem_1fr] sm:gap-6"
                  >
                    <Icon className="h-6 w-6 text-cyan-300" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-white">
                      {audience.title}
                    </h3>
                    <p className="leading-7 text-blue-100/70">
                      {audience.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/watercolor.png"
              alt="Watercolor illustration style available in TaleCrafter"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 text-cyan-200">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">
                Creative control
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
              AI supports the process. Your direction defines the story.
            </h2>
            <div className="mt-6 space-y-5 leading-8 text-blue-100/75">
              <p>
                TaleCrafter is built as a creative starting point, not a replacement
                for human judgment. The subject, intended reader, tone, visual style,
                and branching decisions all come from you.
              </p>
              <p>
                Generated content can vary, so every story should be reviewed before
                it is shared, especially when it is intended for children, classrooms,
                or public audiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-blue-200/10 bg-[#0b1c32] px-6 py-20 text-center sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Your next story starts here
          </p>
          <h2 className="mt-5 text-3xl font-bold text-white sm:text-5xl">
            Give an idea somewhere to go.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100/70">
            Create a complete classic storybook or let every decision open a new
            Plot Twist path.
          </p>
          <Link
            href="/create-story"
            className="tc-btn-primary mt-8 inline-flex items-center gap-2 px-7 py-3"
          >
            Start creating
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default About;
