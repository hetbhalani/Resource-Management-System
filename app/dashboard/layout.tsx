"use client";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { UserProvider } from "@/components/UserProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
                <Sidebar />
                <main className="flex-1 lg:ml-72 min-h-screen transition-all duration-200">
                    <div className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-6">
                        {children}
                    </div>
                </main>
            </div>
        </UserProvider>
    );
}
