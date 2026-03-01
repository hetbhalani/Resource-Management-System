"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import LoginModal from "@/components/LoginModal";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

/* ── Animated Counter Hook ──────────────────── */
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (value >= 1000) return `${(v / 1000).toFixed(v >= value ? 0 : 1)}k`;
    return Math.round(v).toString();
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 1.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      });
      return controls.stop;
    }
  }, [isInView, value, count]);

  return (
    <span ref={ref} className="text-4xl font-bold text-gray-900 tabular-nums">
      <motion.span>{rounded}</motion.span>
      <span className="text-indigo-600">{suffix}</span>
    </span>
  );
}

/* ── Feature Card Data ──────────────────────── */
const features = [
  {
    title: "Resource Management",
    description: "Organize all your resources in one place — classrooms, labs, auditoriums, and more.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    color: "indigo",
  },
  {
    title: "Smart Booking",
    description: "Easy booking process with automatic conflict detection and approval workflows.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
    color: "violet",
  },
  {
    title: "Maintenance Tracking",
    description: "Automated maintenance alerts and scheduling to keep resources in top condition.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    color: "indigo",
  },
  {
    title: "Analytics & Reports",
    description: "Comprehensive reports for usage insights, booking trends, and resource optimization.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3v18h18" />
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
      </svg>
    ),
    color: "violet",
  },
];

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Header — blurs on scroll */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center"
          >
            <Image src="/logo_new.png" alt="Resourcify logo" width={160} height={160} className="object-contain" />
          </motion.div>

          {/* Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex gap-3"
          >
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2 bg-gray-100 border-none rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2 bg-gray-900 border-none rounded-xl text-sm font-medium text-white hover:bg-gray-800 transition-all duration-200 cursor-pointer active:scale-95 shadow-lg shadow-gray-900/10"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-16 px-6 overflow-hidden bg-white">
        {/* Grid Background */}
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:60px_60px]",
            "[background-image:linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)]"
          )}
        />
        {/* Subtle radial fade over grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,white_80%)]" />

        {/* Color accents */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-100/80 blur-[120px] pointer-events-none"></div>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100/70 blur-[120px] pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Manage Resources
              <span className="block mt-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Without the Chaos</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-500 leading-relaxed mb-12 max-w-2xl mx-auto mt-8"
          >
            One platform to book, track, and optimize every resource in your organization. From{" "}
            <span className="text-gray-700 font-medium">meeting rooms</span> to{" "}
            <span className="text-gray-700 font-medium">equipment</span> — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-8 py-3.5 bg-gray-900 border-none rounded-xl text-base font-semibold text-white hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-[0.98] shadow-lg shadow-gray-900/20"
            >
              Get Started — It&apos;s Free
            </button>
          </motion.div>
        </div>

        {/* Stats/Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
          className="relative z-10 mt-20"
        >
          <div className="flex items-center gap-10 sm:gap-14 bg-white/70 backdrop-blur-sm px-10 sm:px-14 py-8 rounded-2xl shadow-xl shadow-gray-900/[0.03] border border-gray-100 ring-1 ring-gray-900/[0.03]">
            <div className="flex flex-col items-center gap-1">
              <AnimatedCounter value={369} suffix="+" />
              <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Organizations</span>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-1">
              <AnimatedCounter value={10000} suffix="+" />
              <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Resources</span>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-1">
              <AnimatedCounter value={99} suffix="%" />
              <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Uptime</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Preview */}
      <section className="py-24 px-6 bg-gray-50/50" ref={featuresRef}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything you need
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Powerful features to help you manage, track, and optimize all your organizational resources.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: "easeOut" }}
                className="p-6 bg-white rounded-2xl border border-gray-100 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900/[0.04] transition-all duration-300 group cursor-default"
              >
                <div className={cn(
                  "w-11 h-11 flex items-center justify-center rounded-xl mb-5 transition-all duration-300",
                  feature.color === "indigo"
                    ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/20"
                    : "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-600/20"
                )}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-gray-100 bg-white">
        <p className="text-gray-400 text-sm">© 2025 Resourcify. All rights reserved.</p>
      </footer>
    </div>
  );
}
