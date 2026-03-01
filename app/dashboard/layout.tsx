"use client";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { UserProvider } from "@/components/UserProvider";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <UserProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
                <Sidebar />
                <main className="flex-1 lg:ml-72 min-h-screen transition-all duration-200">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-6"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </UserProvider>
    );
}
