"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Box,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    Wrench,
    FileText,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Box, label: "Resources", href: "/dashboard/resources" },
    { icon: Calendar, label: "Bookings", href: "/dashboard/bookings" },
    { icon: Wrench, label: "Maintenance", href: "/dashboard/maintenance" },
    { icon: Users, label: "Users", href: "/dashboard/users" },
    { icon: FileText, label: "Reports", href: "/dashboard/reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

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
                animate={{
                    width: collapsed ? 80 : 260,
                    x: getTransformX()
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 flex flex-col"
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
                            R
                        </div>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-semibold text-lg text-slate-800 dark:text-white whitespace-nowrap"
                            >
                                Resourcify
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isMobile && setMobileOpen(false)}
                            >
                                <div
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                                        isActive
                                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
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
                                    {!collapsed && (
                                        <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>
                                            {item.label}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme Toggle & User */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            "flex items-center gap-3 w-full p-2 rounded-lg transition-colors",
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
                        {!collapsed && (
                            <span className="text-sm font-medium">
                                {theme === "light" ? "Dark Mode" : "Light Mode"}
                            </span>
                        )}
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                        <div className="min-w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                            JD
                        </div>
                        {!collapsed && (
                            <>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">John Doe</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Admin</p>
                                </div>
                                <LogOut size={16} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                            </>
                        )}
                    </div>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-violet-600 shadow-sm z-50 transition-colors"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
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
