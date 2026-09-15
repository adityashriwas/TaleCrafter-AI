import Link from "next/link";

const BuyCreditsPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <section className="tc-glass-panel w-full px-6 py-10 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
            Payments paused
          </p>
          <h1 className="tc-title-gradient mt-4 text-3xl font-extrabold sm:text-4xl md:text-5xl">
            Credits purchase is coming soon
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-blue-100/75 md:text-base">
            TaleCrafter AI is migrating payments to a backend-verified provider.
            Credit purchases are temporarily disabled while this production-safe
            flow is being prepared.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="tc-btn-primary px-6 py-3 text-sm font-semibold">
              Back to dashboard
            </Link>
            <Link href="/create-story" className="tc-btn-ghost px-6 py-3 text-sm font-semibold">
              Create a story
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BuyCreditsPage;
