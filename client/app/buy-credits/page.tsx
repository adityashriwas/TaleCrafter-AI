"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { UserDetailContext } from "../_context/UserDetailContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AiOutlineCheck } from "react-icons/ai";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api-client";
import type { UserDetail } from "../_context/UserDetailContext";

const MotionDiv: any = motion.div;

const plans = [
  {
    id: "basic",
    title: "Basic",
    price: 1.99,
    credits: 10,
    highlighted: false,
    subtitle: "Great for getting started",
  },
  {
    id: "premium",
    title: "Premium",
    price: 3.99,
    credits: 75,
    highlighted: true,
    subtitle: "Most popular for regular creators",
  },
  {
    id: "ultimate",
    title: "Ultimate",
    price: 5.99,
    credits: 150,
    highlighted: true,
    subtitle: "Best value for high-volume usage",
  },
];

function PricingOptions() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [shouldScrollToPayment, setShouldScrollToPayment] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [fulfillingPayment, setFulfillingPayment] = useState(false);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { getToken } = useAuth();
  const router = useRouter();
  const paymentSectionRef = useRef<HTMLDivElement | null>(null);
  const fulfilledSessionRef = useRef<string | null>(null);

  const notify = (message: string) => toast(message);
  const notifyError = (message: string) => toast.error(message);

  useEffect(() => {
    if (selectedPlan !== null) {
      setSelectedPrice(plans[selectedPlan]?.price);
      setShouldScrollToPayment(true);
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (!shouldScrollToPayment || selectedPlan === null || selectedPrice <= 0) return;
    const timer = setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setShouldScrollToPayment(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [shouldScrollToPayment, selectedPlan, selectedPrice]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("stripe_session_id");
    const cancelled = params.get("stripe_cancelled");

    if (cancelled) {
      notifyError("Payment cancelled");
      router.replace("/buy-credits");
      return;
    }

    if (!sessionId || fulfilledSessionRef.current === sessionId) return;
    fulfilledSessionRef.current = sessionId;

    const fulfillPayment = async () => {
      try {
        setFulfillingPayment(true);
        const token = await getToken();
        const updatedUser = await apiFetch<UserDetail>(
          "/payments/stripe/checkout-session/" + sessionId + "/fulfill",
          {
            method: "POST",
            token,
          }
        );

        setUserDetail(updatedUser);
        notify("Payment successful, credits have been added!");
        router.replace("/dashboard");
      } catch {
        notifyError("Unable to verify payment. Please contact support if you were charged.");
        router.replace("/buy-credits");
      } finally {
        setFulfillingPayment(false);
      }
    };

    fulfillPayment();
  }, [getToken, router, setUserDetail]);

  const startStripeCheckout = async () => {
    if (selectedPlan === null) {
      notifyError("Please select a plan first.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const token = await getToken();
      const result = await apiFetch<{ url: string }>(
        "/payments/stripe/checkout-session",
        {
          method: "POST",
          token,
          body: JSON.stringify({ planId: plans[selectedPlan].id }),
        }
      );

      window.location.assign(result.url);
    } catch {
      notifyError("Unable to start Stripe checkout. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b1f] px-5 py-8 md:px-16 lg:px-28 xl:px-40">
      <div className="tc-hero-grid absolute inset-0 opacity-35" />
      <div className="tc-hero-orb tc-hero-orb-one" />
      <div className="tc-hero-orb tc-hero-orb-two" />

      <div className="relative">
        <MotionDiv
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.55 }}
          className="tc-glass-panel px-5 py-7 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] md:px-8"
        >
          <h2 className="tc-title-gradient text-3xl font-extrabold sm:text-4xl md:text-5xl">
            Choose Your Plan
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-blue-100/75 md:text-base">
            Add credits instantly and keep generating premium storybooks.
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-blue-300/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-100/90">
            Current credits:
            <span className="ml-2 font-bold text-white">
              {userDetail?.credit ?? "-"}
            </span>
          </div>
        </MotionDiv>

        <MotionDiv
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          transition={{ delay: 0.08, duration: 0.5 }}
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={"flex min-h-[360px] cursor-pointer flex-col justify-between rounded-2xl border p-6 text-left shadow-xl backdrop-blur-sm transition-all duration-200 " +
                (selectedPlan === index
                  ? "border-blue-300/50 bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  : "border-blue-300/20 bg-white/[0.04] hover:-translate-y-1 hover:border-blue-300/35")}
              onClick={() => setSelectedPlan(index)}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                  {plan.highlighted && (
                    <span className="rounded-full border border-cyan-200/40 bg-cyan-400/15 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-blue-100/70">{plan.subtitle}</p>
                <p className="mt-3 text-4xl font-extrabold text-white">
                  ${plan.price}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-blue-100/80">
                  <li className="flex items-center">
                    <AiOutlineCheck className="mr-2 text-green-300" />
                    Get {plan.credits} Credits
                  </li>
                  <li className="flex items-center">
                    <AiOutlineCheck className="mr-2 text-green-300" />
                    No subscription lock-in
                  </li>
                </ul>
              </div>
              <button
                className={"mt-6 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-white transition " +
                  (selectedPlan === index
                    ? "border-blue-200/50 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400"
                    : "border-blue-300/30 bg-white/10 hover:bg-white/15")}
              >
                {selectedPlan === index ? "Selected" : "Select Plan"}
              </button>
            </div>
          ))}
        </MotionDiv>

        {selectedPlan !== null && selectedPrice > 0 && (
          <MotionDiv
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.1, duration: 0.45 }}
            ref={paymentSectionRef}
            className="tc-glass-panel mx-auto mt-8 max-w-2xl p-4"
          >
            <p className="mb-4 text-sm text-blue-100/80">
              Complete secure payment for{" "}
              <span className="font-bold text-white">${selectedPrice.toFixed(2)}</span>
            </p>
            <button
              onClick={startStripeCheckout}
              disabled={checkoutLoading || fulfillingPayment}
              className="tc-btn-primary w-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {fulfillingPayment
                ? "Verifying payment..."
                : checkoutLoading
                ? "Opening Stripe..."
                : "Checkout with Stripe"}
            </button>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}

export default PricingOptions;
