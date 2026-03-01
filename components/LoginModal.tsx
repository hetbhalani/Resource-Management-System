"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, GraduationCap, UserCog, ShieldCheck } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "faculty" | "admin">("faculty");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shakeError, setShakeError] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset form when switching modes
  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("faculty");
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match", {
        description: "Please make sure your passwords match.",
      });
      triggerShake();
      setIsLoading(false);
      return;
    }

    const endpoint = mode === "login" ? "/api/login" : "/api/signup";
    const body = mode === "login"
      ? { email, password, role }
      : { name, email, password, role };

    toast.promise(
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          const errorMessage = data.error || `${mode === "login" ? "Login" : "Signup"} failed`;
          setError(errorMessage);
          setIsLoading(false);
          triggerShake();
          throw new Error(errorMessage);
        }
        return data;
      }),
      {
        loading: mode === "login" ? "Signing in..." : "Creating your account...",
        success: () => {
          onClose();
          router.push("/dashboard");
          return mode === "login"
            ? "Welcome back! You have been logged in successfully."
            : "Account created! You can now access all features.";
        },
        error: (err) => {
          setIsLoading(false);
          return err.message || "Something went wrong. Please try again.";
        },
      }
    );
  };

  const roleOptions = mode === "signup"
    ? ([
      { value: "student" as const, label: "Student", icon: GraduationCap, color: "emerald" },
      { value: "faculty" as const, label: "Faculty", icon: UserCog, color: "indigo" },
    ])
    : ([
      { value: "student" as const, label: "Student", icon: GraduationCap, color: "emerald" },
      { value: "faculty" as const, label: "Faculty", icon: UserCog, color: "indigo" },
      { value: "admin" as const, label: "Admin", icon: ShieldCheck, color: "rose" },
    ]);

  if (!isOpen) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <motion.div
          animate={shakeError ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100/80 text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>

          {/* Header with Toggle */}
          <div className="relative px-6 pt-6 pb-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mx-auto mb-4"
            >
              <Image src="/logo_new.png" alt="Resourcify logo" width={140} height={140} className="object-contain mx-auto" />
            </motion.div>

            {/* Toggle — sliding indicator */}
            <div className="relative mx-auto flex w-fit rounded-xl bg-gray-100 p-1">
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm"
                animate={{
                  left: mode === "login" ? "4px" : "50%",
                  width: mode === "login" ? "calc(50% - 4px)" : "calc(50% - 4px)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`relative z-10 px-7 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${mode === "login"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`relative z-10 px-7 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${mode === "signup"
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {mode === "signup" && (
                  <motion.div variants={fieldVariants}>
                    <label htmlFor="modal-name" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                      Full name
                    </label>
                    <input
                      id="modal-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Bruce Wayne"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </motion.div>
                )}

                <motion.div variants={fieldVariants}>
                  <label htmlFor="modal-email" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                    Email address
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                  />
                </motion.div>

                <motion.div variants={fieldVariants}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="modal-password" className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="modal-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>

                {mode === "signup" && (
                  <motion.div variants={fieldVariants}>
                    <label htmlFor="modal-confirm-password" className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                      Confirm password
                    </label>
                    <input
                      id="modal-confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full rounded-xl border bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 ${confirmPassword && confirmPassword !== password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                        }`}
                    />
                    {confirmPassword && confirmPassword !== password && (
                      <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                    )}
                  </motion.div>
                )}

                {/* Role Selection */}
                <motion.div variants={fieldVariants}>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Select your role
                  </label>
                  <div className="flex gap-2">
                    {roleOptions.map((opt) => {
                      const isSelected = role === opt.value;
                      const colorMap: Record<string, { selected: string; border: string }> = {
                        emerald: { selected: "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-400/20", border: "border-gray-200" },
                        indigo: { selected: "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-400/20", border: "border-gray-200" },
                        rose: { selected: "border-rose-400 bg-rose-50 ring-1 ring-rose-400/20", border: "border-gray-200" },
                      };
                      const colors = colorMap[opt.color] || colorMap.indigo;

                      return (
                        <label
                          key={opt.value}
                          className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm ${isSelected ? colors.selected : `${colors.border} bg-gray-50/50 hover:bg-gray-100/50`
                            }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={opt.value}
                            checked={isSelected}
                            onChange={(e) => setRole(e.target.value as "student" | "faculty" | "admin")}
                            className="sr-only"
                          />
                          <opt.icon size={18} className={isSelected ? `text-${opt.color}-600` : "text-gray-400"} strokeWidth={isSelected ? 2.2 : 1.6} />
                          <span className={`text-xs font-medium capitalize ${isSelected ? `text-${opt.color}-700` : "text-gray-500"}`}>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-red-500 text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  variants={fieldVariants}
                  type="submit"
                  disabled={isLoading || (mode === "signup" && confirmPassword !== password && confirmPassword !== "")}
                  className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {mode === "login" ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    mode === "login" ? "Sign in" : "Create account"
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {mode === "signup" && (
              <p className="mt-3 text-center text-xs text-gray-400">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 transition-colors">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 transition-colors">Privacy Policy</Link>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
