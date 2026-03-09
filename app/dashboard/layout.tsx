"use client";
import React, { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { UserProvider, useUser } from "@/components/UserProvider";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

/**
 * Role-based route access map.
 * Each key is a dashboard path prefix, and the value is the list of roles allowed.
 * The "/dashboard" exact path and "/dashboard/unauthorized" are accessible to everyone.
 */
const routeAccess: { path: string; roles: string[] }[] = [
    { path: "/dashboard/resources", roles: ["admin"] },
    { path: "/dashboard/cupboards", roles: ["admin", "student", "faculty"] },
    { path: "/dashboard/bookings", roles: ["admin", "student", "faculty"] },
    { path: "/dashboard/buildings", roles: ["admin"] },
    { path: "/dashboard/resource-types", roles: ["admin"] },
    { path: "/dashboard/maintenance", roles: ["admin", "student", "faculty", "maintainer"] },
];

function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (loading || !user) return;

        // Always allow the base dashboard and unauthorized page
        if (pathname === "/dashboard" || pathname === "/dashboard/unauthorized") return;

        const role = user.role;
        const rule = routeAccess.find((r) => pathname === r.path || pathname.startsWith(r.path + "/"));

        // If no rule found for this route, block access (deny by default for unknown routes)
        if (!rule) {
            router.replace("/dashboard/unauthorized");
            return;
        }

        if (!rule.roles.includes(role)) {
            router.replace("/dashboard/unauthorized");
        }
    }, [user, loading, pathname, router]);

    return <>{children}</>;
}

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
                    <RouteGuard>
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
                    </RouteGuard>
                </main>
            </div>
        </UserProvider>
    );
}
