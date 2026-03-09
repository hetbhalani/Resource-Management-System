"use client";
import { motion } from "framer-motion";
import { ShieldX } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-6">
          <ShieldX className="w-10 h-10 text-rose-500 dark:text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8">
          You don&apos;t have permission to access this page. Please contact your
          administrator if you believe this is a mistake.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors active:scale-[0.98]"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
