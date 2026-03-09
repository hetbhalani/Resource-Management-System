"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import LoginModal from "@/components/LoginModal";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck2,
  Wrench,
  BarChart3,
  Building2,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Star,
} from "lucide-react";

/* ── Animated Counter ──────────────────────── */
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
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
        duration: 2,
        ease: [0.25, 0.46, 0.45, 0.94],
      });
      return controls.stop;
    }
  }, [isInView, value, count]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/* ── Floating Particles ──────────────────────── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 opacity-20"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

/* ── Feature Data ────────────────────────────── */
const features = [
  {
    title: "Resource Management",
    description:
      "Organize all your resources in one place — classrooms, labs, auditoriums, and more.",
    icon: LayoutDashboard,
    gradient: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    title: "Smart Booking",
    description:
      "Easy booking process with automatic conflict detection and approval workflows.",
    icon: CalendarCheck2,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    title: "Maintenance Tracking",
    description:
      "Automated maintenance alerts and scheduling to keep resources in top condition.",
    icon: Wrench,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    title: "Analytics & Reports",
    description:
      "Comprehensive reports for usage insights, booking trends, and resource optimization.",
    icon: BarChart3,
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  {
    title: "Building Management",
    description:
      "Manage multiple buildings, floors, and rooms with intuitive hierarchical navigation.",
    icon: Building2,
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    text: "text-pink-600",
  },
  {
    title: "Role-Based Access",
    description:
      "Fine-grained permission controls for admins, faculty, students, and maintenance staff.",
    icon: ShieldCheck,
    gradient: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
];

/* ── How It Works ────────────────────────────── */
const howItWorks = [
  {
    step: "01",
    title: "Sign Up & Configure",
    description: "Create your account and set up your organization's buildings, floors, and resources in minutes.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Book Resources",
    description: "Browse available resources, check real-time availability, and submit booking requests instantly.",
    icon: CalendarCheck2,
  },
  {
    step: "03",
    title: "Track & Optimize",
    description: "Monitor usage analytics, manage maintenance schedules, and optimize resource allocation.",
    icon: BarChart3,
  },
];

/* ── Testimonials ────────────────────────────── */
const testimonials = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Dean of Engineering",
    quote: "Resourcify transformed how we manage our 200+ labs and classrooms. Booking conflicts dropped by 95%.",
    avatar: "SM",
    color: "bg-indigo-500",
  },
  {
    name: "James Chen",
    role: "Facilities Manager",
    quote: "The maintenance tracking alone saved us 20 hours per week. The analytics dashboard is incredibly powerful.",
    avatar: "JC",
    color: "bg-violet-500",
  },
  {
    name: "Prof. Amanda Torres",
    role: "Department Chair",
    quote: "Finally, a resource management tool that's actually easy to use. My faculty adopted it within a week.",
    avatar: "AT",
    color: "bg-emerald-500",
  },
];

/* ── Main Page ───────────────────────────────── */
export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });

  const howRef = useRef<HTMLDivElement>(null);
  const howInView = useInView(howRef, { once: true, margin: "-80px" });

  const testimonialsRef = useRef<HTMLDivElement>(null);
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-80px" });

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });

  const heroImageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroImageRef,
    offset: ["start end", "end start"],
  });
  const heroImageY = useSpring(useTransform(scrollYProgress, [0, 1], [40, -40]), {
    stiffness: 100,
    damping: 30,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* ─── Sticky Header ───────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center"
          >
            <Image
              src="/logo_new.png"
              alt="Resourcify logo"
              width={160}
              height={160}
              className="object-contain"
            />
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            {["Features", "How it Works", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex gap-3"
          >
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2.5 bg-transparent border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 border-none rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-95"
            >
              Get Started Free
            </button>
          </motion.div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────── */}
      <section className="relative pt-32 pb-8 px-6 overflow-hidden bg-white">
        {/* Grid Background */}
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:60px_60px]",
            "[background-image:linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)]"
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,white_75%)]" />

        <FloatingParticles />

        {/* Gradient orbs */}
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-100/60 blur-[140px] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-100/50 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-purple-50/40 blur-[120px] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">
              Trusted by 300+ organizations worldwide
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-950 tracking-tight leading-[1.05] drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]">
              Manage Resources
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Without the Chaos
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mt-8 mb-10"
          >
            One platform to book, track, and optimize every resource in your
            organization. From{" "}
            <span className="text-gray-700 font-medium">meeting rooms</span> to{" "}
            <span className="text-gray-700 font-medium">equipment</span> —
            streamlined and effortless.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 border-none rounded-2xl text-base font-semibold text-white hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center gap-2"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <a
              href="#features"
              className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-[0.98] no-underline"
            >
              See Features
            </a>
          </motion.div>
        </div>

        {/* ─── Dashboard Screenshot ────────────────── */}
        <motion.div
          ref={heroImageRef}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: heroImageY }}
          className="relative z-10 max-w-6xl mx-auto mt-20"
        >
          {/* Glow behind the image */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-60" />

          <div className="relative rounded-2xl overflow-hidden border border-gray-200/60 shadow-2xl shadow-gray-900/10 bg-white">
            {/* Browser chrome bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white rounded-lg text-xs text-gray-400 border border-gray-200 font-mono">
                  resourcify.app/dashboard
                </div>
              </div>
              <div className="w-16" />
            </div>
            <Image
              src="/admin.png"
              alt="Resourcify Admin Dashboard"
              width={1400}
              height={800}
              className="w-full h-auto"
              priority
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Logos / Social Proof Strip ───────────── */}
      <section className="py-16 px-6 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Trusted by leading institutions
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center gap-12 md:gap-16 flex-wrap"
          >
            {["MIT", "Stanford", "Harvard", "Oxford", "Cambridge"].map(
              (name, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-xl md:text-2xl font-bold text-gray-700 tracking-wider select-none"
                >
                  {name}
                </motion.span>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Banner ────────────────────────── */}
      <section ref={statsRef} className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 369, suffix: "+", label: "Organizations" },
              { value: 10000, suffix: "+", label: "Resources Managed" },
              { value: 99, suffix: "%", label: "Uptime" },
              { value: 50000, suffix: "+", label: "Bookings / Month" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ────────────────────── */}
      <section
        id="features"
        className="py-24 px-6 bg-gray-50/50"
        ref={featuresRef}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
              Everything you need to manage
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                your resources
              </span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Powerful features designed to help you organize, track, and
              optimize all your organizational resources — effortlessly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + i * 0.08,
                    ease: "easeOut",
                  }}
                  className="group relative p-8 bg-white rounded-2xl border border-gray-100 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-900/[0.06] transition-all duration-300 cursor-default overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500",
                      feature.gradient
                    )}
                  />
                  <div
                    className={cn(
                      "relative w-12 h-12 flex items-center justify-center rounded-xl mb-6 transition-all duration-300",
                      feature.bg,
                      feature.text
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="relative text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="relative text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-6 bg-white"
        ref={howRef}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
              Up and running in{" "}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                minutes
              </span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Three simple steps to transform your resource management workflow.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200" />

            {howItWorks.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  animate={howInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative text-center"
                >
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white mb-6 shadow-lg shadow-indigo-500/20">
                    <Icon className="w-7 h-7" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-indigo-500 text-xs font-bold text-indigo-600 flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────── */}
      <section
        id="testimonials"
        className="py-24 px-6 bg-gray-50/50"
        ref={testimonialsRef}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
              Loved by teams{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                everywhere
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-900/[0.04] transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star
                      key={si}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                      t.color
                    )}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Highlights (Alt section) ────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6">
                Why Resourcify?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Built for teams that need{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  real results
                </span>
              </h2>
              <div className="space-y-5">
                {[
                  "Real-time availability and conflict detection",
                  "Automated approval workflows with notifications",
                  "Comprehensive analytics and usage reports",
                  "Multi-building and multi-floor support",
                  "Role-based access control for security",
                  "Maintenance scheduling and tracking",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-gray-600 text-[15px]">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right image/visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-8 text-white overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative space-y-6">
                  <div className="flex items-center gap-3 mb-8">
                    <Zap className="w-8 h-8" />
                    <span className="text-xl font-bold">Quick Stats</span>
                  </div>
                  {[
                    { label: "Avg. setup time", value: "5 min" },
                    { label: "Booking conflicts reduced", value: "95%" },
                    { label: "Time saved weekly", value: "20+ hrs" },
                    { label: "User satisfaction", value: "4.9/5" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                    >
                      <span className="text-white/80 text-sm">
                        {stat.label}
                      </span>
                      <span className="text-lg font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-100" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to streamline your
              <br />
              resource management?
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
              Join hundreds of organizations that have already transformed their
              workflows with Resourcify.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="group px-8 py-4 bg-white border-none rounded-2xl text-base font-semibold text-indigo-700 hover:bg-indigo-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-[0.98] flex items-center gap-2"
              >
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="px-8 py-4 bg-transparent border border-white/30 rounded-2xl text-base font-semibold text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer no-underline"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────── */}
      <footer className="py-16 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Image
                src="/white_logo.png"
                alt="Resourcify"
                width={140}
                height={40}
                className="object-contain mb-4"
              />
              <p className="text-sm text-gray-400 leading-relaxed">
                The modern platform for managing organizational resources
                efficiently and effortlessly.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Integrations", "Changelog"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Security", "Status"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                  {col.title}
                </h4>
                <ul className="space-y-3 list-none p-0 m-0">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-sm text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; 2026 Resourcify. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Twitter", "GitHub", "LinkedIn"].map((social) => (
                <span
                  key={social}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
