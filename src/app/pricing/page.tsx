"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Briefcase,
  Crown,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/api/client";

export default function PricingPage() {
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (_hasHydrated && !accessToken) {
      router.push("/signup");
    }
  }, [accessToken, _hasHydrated, router]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen w-full font-urbanist bg-[#F5F0F8] flex items-center justify-center">
        <div className="text-[#704180] text-xl">Loading...</div>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  const plans = [
    {
      id: "standard",
      name: "Standard",
      icon: Briefcase,
      description:
        "Perfect for clinicians who want to be listed as Zenomi doctors with flexible course access",
      price: "₹9,999",
      features: [
        "Listed as Zenomi doctors",
        "Set your own consultation fees",
        "Pay-as-you-go for courses (₹499 per course)",
        "Yearly subscription",
      ],
      buttonText: "Subscribe now",
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      icon: Crown,
      description:
        "Complete access to all micro lessons and full Zenomi doctor listing benefits",
      price: "₹19,999",
      features: [
        "Listed as Zenomi doctors",
        "Set your own consultation fees",
        "Access to all micro lessons by default",
        "Yearly subscription",
      ],
      buttonText: "Subscribe now",
      popular: true,
    },
  ];

  const handleCheckout = async (plan: (typeof plans)[0]) => {
    // Extract numeric amount from price string (e.g., "₹9,999" -> 9999)
    const amount = parseInt(plan.price.replace(/[^0-9]/g, ""));

    if (isNaN(amount)) {
      console.error("Invalid price format");
      alert("Invalid price format. Please try again.");
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      const response = await apiClient.post<{
        sessionId: string;
        url: string;
        amount: number;
        currency: string;
      }>("/payments/clinicians/checkout", {
        amount,
      });

      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initiate checkout. Please try again.";
      alert(errorMessage);
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen w-full font-urbanist bg-[#F5F0F8]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-900 hover:text-[#8B2D6C] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-[#704180]">
              Choose Your Plan
            </h1>
          </div>
          <p className="text-gray-700 text-base ml-10">
            Choose the perfect plan for your practice. Both plans include Zenomi doctor listing and consultation fee management.
          </p>
        </div>

        <div className="flex flex-row gap-8 max-w-[1600px] mx-auto justify-center">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className="relative bg-white rounded-[32px] border border-[#CECECE] flex-1 flex flex-col min-w-[320px] max-w-[450px] p-8 gap-8 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-[linear-gradient(180deg,#704180_0%,#8B2D6C_100%)] group"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="w-[52px] h-[52px] rounded-lg flex items-center justify-center border border-[#E6E6E6] bg-[linear-gradient(140deg,#704180_0%,transparent_100%)] shadow-[inset_0px_-2px_3px_0px_rgba(139,45,108,0.2),inset_0px_1px_1px_0px_rgba(255,255,255,0.15)]">
                        <Icon className="w-6 h-6 text-[#8B2D6C] group-hover:text-white transition-colors duration-300" />
                      </div>

                      {plan.popular && (
                        <div className="px-3 py-2.5 rounded-full text-xs font-medium text-black bg-linear-to-b from-[#F7C569] to-[#FBBC05] group-hover:bg-white group-hover:text-[#8B2D6C] transition-all duration-300">
                          Most Popular
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <h3 className="text-xl font-semibold text-black leading-[1.15em] group-hover:text-white transition-colors duration-300">
                        {plan.name}
                      </h3>
                      <p className="text-base font-normal text-[#4E4E4E] leading-[1.4em] group-hover:text-white transition-colors duration-300">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end gap-0.5">
                    <span className="text-[40px] font-semibold text-black leading-[1.15em] group-hover:text-white transition-colors duration-300">
                      {plan.price}
                    </span>
                    <span className="text-sm font-normal text-[#6A6A6A] leading-[1.15em] mb-1 group-hover:text-white transition-colors duration-300">
                      /year
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-6 h-6 text-[#8B2D6C] shrink-0 group-hover:text-white transition-colors duration-300" />
                        <span className="text-sm font-normal text-[#2C2C2C] leading-[1.15em] group-hover:text-white transition-colors duration-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={loadingPlanId === plan.id}
                    className="w-full py-2 px-[18px] rounded-xl font-semibold text-base text-white transition-all duration-300 hover:opacity-90 cursor-pointer bg-linear-to-r from-[#8B2D6C] to-[#704180] border border-[#514F6E] shadow-[0px_3px_6px_0px_rgba(7,0,110,0.03),inset_0px_-2px_2px_0px_rgba(10,16,50,0.07)] group-hover:bg-[#a76594] group-hover:border-[#a76594] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingPlanId === plan.id
                      ? "Processing..."
                      : plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
