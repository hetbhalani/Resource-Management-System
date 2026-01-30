"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match", {
        description: "Please make sure your passwords match.",
      });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="relative rounded-3xl bg-white shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
          >
            ✕
          </button>

          {/* Header with Toggle */}
          <div className="relative px-6 pt-6 pb-4 text-center">
            <div className="mx-auto mb-4">
              <Image src="/logo_new.png" alt="Resourcify logo" width={150} height={150} className="object-contain mx-auto" />
            </div>

            {/* Toggle */}
            <div className="mx-auto flex w-fit rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === "login"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div>
                  <label htmlFor="modal-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bruce Wayne"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-black placeholder-gray-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}

              <div>
                <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-black placeholder-gray-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700">
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
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 text-sm text-black placeholder-gray-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-sm"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label htmlFor="modal-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    id="modal-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-sm text-black placeholder-gray-400 transition focus:bg-white focus:outline-none focus:ring-2 ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select your role
                </label>
                <div className="flex gap-2">
                  {(["student", "faculty", "admin"] as const).map((roleOption) => (
                    <label
                      key={roleOption}
                      className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg border cursor-pointer transition-all ${
                        role === roleOption
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={roleOption}
                        checked={role === roleOption}
                        onChange={(e) => setRole(e.target.value as "student" | "faculty" | "admin")}
                        className="sr-only"
                      />
                      <span className="text-xs font-medium capitalize">{roleOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || (mode === "signup" && confirmPassword !== password && confirmPassword !== "")}
                className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  mode === "login" ? "Sign in" : "Create account"
                )}
              </button>
            </form>

            {mode === "signup" && (
              <p className="mt-3 text-center text-xs text-gray-500">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
