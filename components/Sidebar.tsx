"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Box,
    Calendar,
    LogOut,
    Menu,
    X,
    Wrench,
    Building2,
    Tags,
    Sun,
    Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { useUser } from "./UserProvider";

const allSidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["admin", "student", "faculty"] },
    { icon: Box, label: "Resources", href: "/dashboard/resources", roles: ["admin"] },
    { icon: Calendar, label: "Bookings", href: "/dashboard/bookings", roles: ["admin", "student", "faculty"] },
    { icon: Building2, label: "Buildings", href: "/dashboard/buildings", roles: ["admin"] },
    { icon: Tags, label: "Resource Types", href: "/dashboard/resource-types", roles: ["admin"] },
    { icon: Wrench, label: "Maintenance", href: "/dashboard/maintenance", roles: ["admin", "student", "faculty"] },
];

export const Sidebar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { user } = useUser();

    const sidebarItems = allSidebarItems.filter(item =>
        item.roles.includes(user?.role || "student")
    );

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const getTransformX = () => {
        if (isMobile) {
            return mobileOpen ? 0 : "-100%";
        }
        return 0;
    };

    const getInitials = (name: string) => {
        if (!name) return "X";
        const words = name.trim().split(/\s+/);
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin": return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400";
            case "faculty": return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400";
            case "student": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
            default: return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-5 left-5 z-50 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? (
                    <X size={20} className="text-slate-700 dark:text-slate-200" />
                ) : (
                    <Menu size={20} className="text-slate-700 dark:text-slate-200" />
                )}
            </button>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: getTransformX() }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 flex flex-col shadow-lg"
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="relative ms-9 h-20 w-40 overflow-hidden">
                            <Image
                                src={theme === "dark" ? "/white_logo.png" : "/black_logo.png"}
                                alt="Resourcify"
                                fill
                                className="object-contain"
                                sizes="200px"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-5 px-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isMobile && setMobileOpen(false)}
                            >
                                <div
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative",
                                        isActive
                                            ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-sm"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 w-1 h-8 bg-violet-600 rounded-r-full"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn(
                                            "min-w-[20px]",
                                            isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
                                        )}
                                    />
                                    <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme Toggle & User */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            "flex items-center gap-3 w-full p-2.5 rounded-xl transition-colors",
                            "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                    >
                        <div className="min-w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                            {theme === "light" ? (
                                <Moon size={18} className="text-sky-600 dark:text-sky-400" />
                            ) : (
                                <Sun size={18} className="text-sky-600 dark:text-sky-400" />
                            )}
                        </div>
                        <span className="text-sm font-medium">
                            {theme === "light" ? "Dark Mode" : "Light Mode"}
                        </span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="min-w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                            {user ? getInitials(user.name) : "?"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {user?.name || "Loading..."}
                            </p>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${user?.role ? getRoleBadgeColor(user.role) : ""}`}>
                                {user?.role || ""}
                            </span>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch("/api/logout", { method: "POST" });
                                    if (res.ok) router.push("/");
                                } catch (error) {
                                    console.error("Logout failed:", error);
                                }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
};
