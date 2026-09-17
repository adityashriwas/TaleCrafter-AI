"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Video from "./Video";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
const MotionDiv = motion.div;

type StatItem = {
  value: number;
  suffix?: string;
  label: string;
  isText?: boolean;
};

const AnimatedStat = ({ stat, index }: { stat: StatItem; index: number }) => {
  const [displayValue, setDisplayValue] = useState(stat.isText ? stat.value : 0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node || stat.isText) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) {
          return;
        }

        setHasAnimated(true);
        const duration = 1300;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          setDisplayValue(Math.round(stat.value * easedProgress));

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.45 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasAnimated, stat.isText, stat.value]);

  return (
    <MotionDiv
      ref={ref}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      transition={{ delay: index * 0.08, duration: 0.55 }}
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: { opacity: 1, y: 0 },
      }}
      className="group relative min-h-[155px] overflow-hidden rounded-2xl border border-blue-200/15 bg-white/[0.055] p-6 text-left shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-white/[0.075] sm:min-h-[175px] sm:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl transition group-hover:bg-cyan-300/20" />
      <p
        className={`text-4xl font-extrabold leading-none tracking-normal sm:text-5xl ${
          index === 0 ? "text-cyan-200" : "text-white"
        }`}
      >
        {stat.isText ? "TTS" : displayValue}
        {stat.suffix}
      </p>
      <p className="mt-6 max-w-[12rem] text-base font-medium leading-relaxed text-blue-100/72 sm:text-lg">
        {stat.label}
      </p>
    </MotionDiv>
  );
};

const Hero = () => {
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      credits: "5",
      subtitle: "Included for new accounts",
      recommended: false,
      ctaLabel: "Start Free",
      href: "/create-story",
    },
    {
      name: "Basic",
      price: "$1.99",
      credits: "10",
      subtitle: "Great for getting started",
      recommended: false,
      ctaLabel: "Select Plan",
      href: "/buy-credits",
    },
    {
      name: "Premium",
      price: "$3.99",
      credits: "75",
      subtitle: "Most popular for regular creators",
      recommended: true,
      ctaLabel: "Choose Premium",
      href: "/buy-credits",
    },
    {
      name: "Ultimate",
      price: "$5.99",
      credits: "150",
      subtitle: "Best value for power users",
      recommended: false,
      ctaLabel: "Select Plan",
      href: "/buy-credits",
    },
  ];

  const { isSignedIn } = useUser();
  const secondaryHeroHref = isSignedIn ? "/dashboard" : "#pricing";
  const secondaryHeroLabel = isSignedIn ? "Dashboard" : "View Pricing";

  const heroStats: StatItem[] = [
    { value: 40, suffix: "+", label: "Languages" },
    { value: 9, label: "Story Genres" },
    { value: 7, label: "Art Styles" },
    { value: 30, suffix: "+", label: "Countries Reached" },
  ];

  const featureItems = [
    {
      title: "AI-Powered Book Generation",
      description:
        "Turn any idea into a complete storybook with chapter flow, visuals, and polished output in seconds.",
      icon: "01",
    },
    {
      title: "Image to Story",
      description:
        "Upload an image and let AI detect scenes, mood, and characters to craft a tailored story concept.",
      icon: "02",
    },
    {
      title: "Illustration Styles",
      description:
        "Generate artwork in anime, watercolor, comic, oil paint, 3D, pixel, and more visual directions.",
      icon: "03",
    },
    {
      title: "Narrated Reading",
      description:
        "Play chapter narration with smart controls that automatically stop previous audio when a new page starts.",
      icon: "04",
    },
    {
      title: "Global Language Support",
      description:
        "Create stories in multiple languages and share content with learners and readers across regions.",
      icon: "05",
    },
    {
      title: "Interactive Book Experience",
      description:
        "Switch between Flipbook and Story modes, then export image-rich PDFs directly from Story mode.",
      icon: "06",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="relative overflow-hidden bg-[#020b1f] text-blue-100">
        <div className="tc-hero-grid absolute inset-0 opacity-40" />
        <div className="tc-hero-orb tc-hero-orb-one" />
        <div className="tc-hero-orb tc-hero-orb-two" />
        <div className="tc-hero-orb tc-hero-orb-three" />

        <section className="section-spacing relative flex min-h-[86vh] flex-col justify-center px-4 md:px-16 lg:px-32 xl:px-44">
          <MotionDiv
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7 }}
            variants={fadeUp}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-flex items-center rounded-full border border-blue-300/30 bg-blue-500/10 px-5 py-2 text-sm font-medium tracking-wide text-blue-100 backdrop-blur-sm">
              Build branching storybooks with AI
            </span>

            <h1 className="tc-title-gradient mt-7 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
              TaleCrafter AI
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                Convert your thoughts into interactive stories
              </span>
            </h1>
            <TextGenerateEffect
              as="p"
              words="Create polished, illustrated, and narrated digital books from a single prompt with interactive branching paths. Designed for creators, educators, and teams that want story production to feel premium."
              className="mx-auto mt-7 max-w-3xl text-base font-medium leading-relaxed text-blue-100/75 sm:text-lg"
              duration={0.4}
              staggerDelay={0.035}
              startDelay={0.8}
            />
          </MotionDiv>

          <MotionDiv
            initial="hidden"
            animate="show"
            transition={{ delay: 1.8, duration: 0.6 }}
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/create-story">
              <Button className="tc-btn-primary px-7 py-6 text-base shadow-[0_0_30px_rgba(29,141,255,0.3)] hover:scale-[1.03]">
                Create Interactive Story
              </Button>
            </Link>
            <Link href={secondaryHeroHref}>
              <Button
                aria-label={secondaryHeroLabel}
                className="tc-btn-ghost tc-btn-hero-secondary px-7 py-6 text-base backdrop-blur-sm hover:scale-[1.03]"
              >
                {secondaryHeroLabel}
              </Button>
            </Link>
          </MotionDiv>

        </section>

        <section className="relative mt-24 px-4 py-10 sm:py-12 md:mt-32 md:px-16 lg:mt-40 lg:px-32 xl:px-44">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((stat, index) => (
              <AnimatedStat key={stat.label} stat={stat} index={index} />
            ))}
          </div>
        </section>

        <section className="section-spacing relative mt-24 px-4 md:mt-32 md:px-16 lg:mt-40 lg:px-32 xl:px-44">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="tc-title-gradient heading">
              Built for modern AI storytelling workflows
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100/70">
              Every major experience from idea generation to book-like reading
              is optimized for quality, speed, and visual consistency.
            </p>
          </div>

          <MotionDiv
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.08 }}
            className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featureItems.map((item) => (
              <MotionDiv
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="tc-glass-panel-soft group p-6 shadow-[0_10px_40px_rgba(3,10,30,0.45)] transition hover:-translate-y-1 hover:border-blue-300/40 hover:bg-blue-400/10"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white">
                  {item.icon}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 leading-relaxed text-blue-100/70">
                  {item.description}
                </p>
              </MotionDiv>
            ))}
          </MotionDiv>

        </section>

        <section className="section-spacing relative mt-24 px-4 md:mt-32 md:px-16 lg:mt-40 lg:px-32 xl:px-44">
          <Video />
        </section>

        <section id="pricing" className="section-spacing relative mt-24 px-4 md:mt-32 md:px-16 lg:mt-40 lg:px-32 xl:px-44">
          <div className="text-center">
            <h2 className="tc-title-gradient text-3xl font-bold sm:text-4xl">
              Simple pricing for rapid creation
            </h2>
            <p className="mt-3 text-blue-100/70">
              Pick a plan and scale story generation as your usage grows.
            </p>
            <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-6 p-2 text-white sm:grid-cols-2 lg:grid-cols-4">
              {pricingPlans.map((plan, index) => {
                const isFeatured = plan.recommended;

                return (
                  <div
                    key={index}
                    className={`tc-glass-panel-soft relative flex min-h-[260px] w-full flex-col justify-between p-7 text-left shadow-xl ${
                      isFeatured
                        ? "border-blue-200/70 bg-blue-600/20 shadow-[0_0_42px_rgba(37,99,235,0.24)]"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-semibold text-blue-100">
                          {plan.name}
                        </h3>
                        {isFeatured && (
                          <span className="whitespace-nowrap rounded-full border border-blue-200/60 bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-normal text-white">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-blue-100/70">{plan.subtitle}</p>
                      <p className="my-3 text-4xl font-extrabold text-white">
                        {plan.price}
                      </p>
                      <p className="text-blue-100/85">Get {plan.credits} Credits</p>
                    </div>

                    <Link href={plan.href}>
                      <Button
                        aria-label={`Select ${plan.name} plan`}
                        className={`mt-5 w-full px-6 py-5 text-sm ${
                          isFeatured
                            ? "tc-btn-primary shadow-[0_0_28px_rgba(37,99,235,0.24)]"
                            : "tc-btn-ghost"
                        }`}
                      >
                        {plan.ctaLabel}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Hero;
