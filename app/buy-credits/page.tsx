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

function PricingOptions() {
  const plans = [
    {
      id: 1,
      title: "Basic",
      price: 1.99,
      credits: 10,
      highlighted: false,
    },
    {
      id: 2,
      title: "Standard",
      price: 2.99,
      credits: 30,
      highlighted: false,
    },
    {
      id: 3,
      title: "Premium",
      price: 3.99,
      credits: 75,
      highlighted: true,
    },
    {
      id: 4,
      title: "Ultimate",
      price: 5.99,
      credits: 150,
      highlighted: true,
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const router = useRouter();

  const notify = (message: string) => toast(message);
  const notifyError = (message: string) => toast.error(message);

  useEffect(() => {
    if (selectedPlan !== null) {
      setSelectedPrice(plans[selectedPlan]?.price);
    }
  }, [selectedPlan]);

  const handlePaymentSuccess = async () => {
    const selectedCredits = plans[selectedPlan!].credits;

    const result = await db
      .update(Users)
      .set({ credit: selectedCredits + userDetail?.credits })
      .where(eq(Users.userEmail, userDetail.userEmail));

    if (result) {
      notify("Payment Successful, credits have been added!");
      setUserDetail((prev: any) => ({
        ...prev,
        credit: selectedCredits + userDetail?.credits,
      }));
      router.replace("/dashboard");
    } else {
      notifyError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0f25] to-[#071340] text-center p-10 md:px-20 lg:px-40 ">
      <h2 className="text-4xl font-bold mb-6 block bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
        Choose Your Plan
      </h2>

      <div className="flex justify-center items-center space-x-4 flex-wrap text-gray-300">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`cursor-pointer flex-1 max-w-sm bg-[#224] p-6 m-4 rounded-lg w-64 text-center shadow-lg border border-neutral-800 bg-neutral-900/50 transition-all duration-200 
                        ${
                          selectedPlan === index
                            ? "border-4 border-orange-500"
                            : ""
                        }
                        ${selectedPlan === index ? "bg-black" : ""}`}
            onClick={() => setSelectedPlan(index)}
          >
            <h3 className="text-lg font-bold">{plan.title}</h3>
            <p className="text-2xl my-2">${plan.price}</p>
            <ul className="text-sm">
              <li className="flex items-center">
                <AiOutlineCheck className="mr-2 text-green-400" /> Get{" "}
                {plan.credits} Credits
              </li>
            </ul>
            <button
              className={`mt-4 w-full ${
                plan.highlighted
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } 
                          text-white font-bold py-2 px-4 rounded`}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>

      <p><strong>Having payment issues?</strong> Request credits via the feedback form. Make sure to mention your registered email to help us process your request.</p>

      {selectedPlan !== null && selectedPrice > 0 && (
        <div className="mt-8">
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
        </div>
      )}
    </div>
  );
}

export default PricingOptions;
