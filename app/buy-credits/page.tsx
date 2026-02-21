"use client";
import { db } from "@/config/config";
import { PayPalButtons } from "@paypal/react-paypal-js";
import React, { useContext, useEffect, useState } from "react";
import { UserDetailContext } from "../_context/UserDetailContext";
import { eq } from "drizzle-orm";
import { Users } from "@/config/schema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AiOutlineCheck } from "react-icons/ai";
import { motion } from "framer-motion";
const MotionDiv: any = motion.div;

function PricingOptions() {
  const plans = [
    {
      id: 1,
      title: "Basic",
      price: 1.99,
      credits: 10,
      highlighted: false,
      subtitle: "Great for getting started",
    },
    {
      id: 2,
      title: "Premium",
      price: 3.99,
      credits: 75,
      highlighted: true,
      subtitle: "Most popular for regular creators",
    },
    {
      id: 3,
      title: "Ultimate",
      price: 5.99,
      credits: 150,
      highlighted: true,
      subtitle: "Best value for high-volume usage",
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [shouldScrollToPayment, setShouldScrollToPayment] = useState(false);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const router = useRouter();
  const paymentSectionRef = React.useRef<HTMLDivElement | null>(null);

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

  const handlePaymentSuccess = async () => {
    if (selectedPlan === null || !userDetail?.userEmail) {
      notifyError("Unable to verify user details. Please try again.");
      return;
    }

    const selectedCredits = plans[selectedPlan!].credits;
    const currentCredits = Number(userDetail?.credit ?? 0);
    const updatedCredits = selectedCredits + currentCredits;

    const result = await db
      .update(Users)
      .set({ credit: updatedCredits })
      .where(eq(Users.userEmail, userDetail.userEmail));

    if (result) {
      notify("Payment Successful, credits have been added!");
      setUserDetail((prev: any) => ({
        ...prev,
        credit: updatedCredits,
      }));
      router.replace("/dashboard");
    } else {
      notifyError("Server error. Please try again.");
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
          className="rounded-2xl border border-blue-300/20 bg-white/[0.04] px-5 py-7 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-8"
        >
          <h2 className="bg-gradient-to-b from-white via-blue-100 to-blue-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl">
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
              key={index}
              className={`flex min-h-[360px] cursor-pointer flex-col justify-between rounded-2xl border p-6 text-left shadow-xl backdrop-blur-sm transition-all duration-200 ${
                selectedPlan === index
                  ? "border-blue-300/50 bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  : "border-blue-300/20 bg-white/[0.04] hover:-translate-y-1 hover:border-blue-300/35"
              }`}
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
                className={`mt-6 w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-white transition ${
                  selectedPlan === index
                    ? "border-blue-200/50 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400"
                    : "border-blue-300/30 bg-white/10 hover:bg-white/15"
                }`}
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
            className="mx-auto mt-8 max-w-2xl rounded-2xl border border-blue-300/20 bg-white/[0.04] p-4 backdrop-blur-md"
          >
            <p className="mb-4 text-sm text-blue-100/80">
              Complete secure payment for{" "}
              <span className="font-bold text-white">${selectedPrice.toFixed(2)}</span>
            </p>
            <PayPalButtons
              style={{ layout: "vertical" }}
              disabled={selectedPlan === null}
              onApprove={() => handlePaymentSuccess()}
              onCancel={() => notifyError("Payment Cancelled")}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: selectedPrice.toFixed(2),
                        currency_code: "USD",
                      },
                    },
                  ],
                  intent: "CAPTURE",
                });
              }}
            />
          </MotionDiv>
        )}
      </div>
    </div>
  );
}

export default PricingOptions;
