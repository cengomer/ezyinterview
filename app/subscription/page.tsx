"use client";

import React from "react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import RequireAuth from "../components/auth/RequireAuth";

const plans = [
  {
    name: "Starter (Free)",
    price: "Free",
    features: [
      "3 analyses per month",
      "Basic support",
      "Access to community",
      "Perfect for job seekers trying out Interview AI",
    ],
    description:
      "Get started with 3 analyses per month, basic support, and access to our community. Perfect for job seekers trying out Interview AI.",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19/mo",
    features: [
      "Unlimited analyses",
      "Priority support",
      "Export Q&A",
      "Early access to new features",
      "Ideal for active job seekers and professionals",
    ],
    description:
      "Unlimited analyses, priority support, export Q&A, and early access to new features. Ideal for active job seekers and professionals.",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$49/mo",
    features: [
      "All Pro features",
      "Team management",
      "Custom onboarding",
      "Dedicated support",
      "SLA",
      "Designed for organizations and career coaches",
    ],
    description:
      "All Pro features plus team management, custom onboarding, dedicated support, and SLA. Designed for organizations and career coaches.",
    popular: false,
  },
];

export default function SubscriptionPage() {
  return (
    <RequireAuth>
      <AuthenticatedLayout>
        {/* Hero Section */}
        <div className="max-w-2xl text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">
            Upgrade your interview prep experience
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Unlock premium features, unlimited analyses, and get ready to ace your next interview. Choose the plan that fits you best!
          </p>
        </div>

        {/* Plans Section */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 justify-center items-stretch mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex-1 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 flex flex-col items-center border-2 transition-transform hover:scale-105 ${
                plan.popular
                  ? "border-indigo-500 ring-2 ring-indigo-200 z-10"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  Most Popular
                </span>
              )}
              <h2 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h2>
              <div className="text-3xl font-extrabold mb-2 text-indigo-600">
                {plan.price}
              </div>
              <div className="mb-4 text-gray-500 text-sm text-center">{plan.description}</div>
              <ul className="mb-8 space-y-2 text-gray-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold text-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${
                  plan.popular
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                }`}
                disabled={true}
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>

        {/* Testimonials / Trust Section */}
        <div className="w-full max-w-3xl bg-white/70 rounded-2xl shadow-lg p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Why upgrade?</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Get more personalized, in-depth interview questions</li>
              <li>Access advanced analytics and export features</li>
              <li>Priority support from our expert team</li>
              <li>Trusted by 1,000+ job seekers worldwide</li>
            </ul>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">🌟</span>
            <span className="text-lg font-semibold text-indigo-600">4.9/5</span>
            <span className="text-gray-500 text-sm">Average user rating</span>
          </div>
        </div>
      </AuthenticatedLayout>
    </RequireAuth>
  );
}
