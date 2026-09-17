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

const MotionDiv = motion.div;

const plans = [
  {
    id: "free",
    title: "Free",
    price: 0,
    credits: 5,
    recommended: false,
    subtitle: "Included for new accounts",
  },
  {
    id: "basic",
    title: "Basic",
    price: 1.99,
    credits: 10,
    recommended: false,
    subtitle: "Great for getting started",
  },
  {
    id: "premium",
    title: "Premium",
    price: 3.99,
    credits: 75,
    recommended: true,
    subtitle: "Most popular for regular creators",
  },
  {
    id: "ultimate",
    title: "Ultimate",
    price: 5.99,
    credits: 150,
    recommended: false,
    subtitle: "Best value for high-volume usage",
  },
];

function PricingOptions() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [shouldScrollToPayment, setShouldScrollToPayment] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
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
    if (!shouldScrollToPayment || selectedPlan === null) return;
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

    const checkPayment = async () => {
      try {
        setCheckingPayment(true);
        const token = await getToken();
        const status = await apiFetch<{
          status: string;
          credits: number;
          user?: UserDetail;
        }>("/payments/stripe/checkout-session/" + sessionId, {
          method: "GET",
          token,
        });

        if (status.user) {
          setUserDetail(status.user);
        }

        if (status.status === "fulfilled") {
          notify("Payment successful, credits have been added!");
          router.replace("/dashboard");
          return;
        }

        notify("Payment received. Credits will appear after Stripe confirms the webhook.");
        router.replace("/buy-credits");
      } catch {
        notifyError("Unable to verify payment status. Please contact support if you were charged.");
        router.replace("/buy-credits");
      } finally {
        setCheckingPayment(false);
      }
    };

    checkPayment();
  }, [getToken, router, setUserDetail]);

  const startStripeCheckout = async () => {
    if (selectedPlan === null) {
      notifyError("Please select a plan first.");
      return;
    }

    if (plans[selectedPlan].price <= 0) {
      notify("Your free 5 credits are included automatically with your account.");
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
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={"flex min-h-[360px] cursor-pointer flex-col justify-between rounded-2xl border p-6 text-left shadow-xl backdrop-blur-sm transition-all duration-200 " +
                (selectedPlan === index
                  ? "border-blue-200/70 bg-blue-600/20 shadow-[0_0_34px_rgba(37,99,235,0.24)]"
                  : plan.recommended
                  ? "border-blue-200/60 bg-blue-600/[0.14] shadow-[0_0_30px_rgba(37,99,235,0.18)] hover:-translate-y-1"
                  : "border-blue-300/20 bg-white/[0.04] hover:-translate-y-1 hover:border-blue-300/35")}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{plan.title}</h3>
                  {plan.recommended && (
                    <span className="rounded-full border border-blue-200/60 bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Most Popular
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
                type="button"
                aria-label={`Select ${plan.title} plan`}
                onClick={() => setSelectedPlan(index)}
                className={"mt-6 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-white transition " +
                  (selectedPlan === index
                    ? "border-blue-200/60 bg-blue-700 hover:bg-blue-600"
                    : plan.recommended
                    ? "border-blue-200/50 bg-blue-600 hover:bg-blue-500"
                    : "border-blue-300/30 bg-white/10 hover:bg-white/15")}
              >
                {selectedPlan === index
                  ? "Selected"
                  : plan.price <= 0
                  ? "Included"
                  : plan.recommended
                  ? "Choose Premium"
                  : "Select Plan"}
              </button>
            </div>
          ))}
        </MotionDiv>

        {selectedPlan !== null && selectedPrice <= 0 && (
          <MotionDiv
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ delay: 0.1, duration: 0.45 }}
            ref={paymentSectionRef}
            className="tc-glass-panel mx-auto mt-8 max-w-2xl p-4"
          >
            <p className="text-sm text-blue-100/80">
              The free plan includes 5 credits automatically on your account. Pick a paid plan when you need more.
            </p>
          </MotionDiv>
        )}

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
              disabled={checkoutLoading || checkingPayment}
              className="tc-btn-primary w-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingPayment
                ? "Checking payment..."
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
