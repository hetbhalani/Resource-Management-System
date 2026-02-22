"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  CalendarCheck,
  AlertTriangle,
  Users,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Loader2,
  Wrench,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/UserProvider";

interface DashboardStats {
  totalResources: number;
  totalBookings: number;
  pendingBookings: number;
  activeMaintenanceCount: number;
  totalUsers: number;
  recentBookings: {
    booking_id: number;
    resource_name: string;
    user_name: string;
    start_datetime: string;
    end_datetime: string;
    status: string;
    created_at: string;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 120, damping: 14 }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
      case "pending": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      case "rejected": return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400";
      case "cancelled": return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
      default: return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {isAdmin ? "Manage resources and review booking requests." : "Book resources and track your reservations."}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
            <Shield size={14} className="text-rose-600 dark:text-rose-400" />
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Admin Panel</span>
          </div>
        )}
      </motion.div>

      {/* Stats - role-aware */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Resources"
          value={stats?.totalResources ?? 0}
          icon={Box}
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          iconColor="text-violet-600 dark:text-violet-400"
          variants={itemVariants}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? 0}
          icon={CalendarCheck}
          iconBg="bg-sky-100 dark:bg-sky-900/30"
          iconColor="text-sky-600 dark:text-sky-400"
          variants={itemVariants}
        />
        {isAdmin ? (
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingBookings ?? 0}
            icon={AlertTriangle}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-500 dark:text-amber-400"
            variants={itemVariants}
            highlight={!!stats?.pendingBookings}
          />
        ) : (
          <StatCard
            title="Active Maintenance"
            value={stats?.activeMaintenanceCount ?? 0}
            icon={Wrench}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-500 dark:text-amber-400"
            variants={itemVariants}
          />
        )}
        {isAdmin ? (
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            iconBg="bg-indigo-100 dark:bg-indigo-900/30"
            iconColor="text-indigo-600 dark:text-indigo-400"
            variants={itemVariants}
          />
        ) : (
          <StatCard
            title="Active Maintenance"
            value={stats?.activeMaintenanceCount ?? 0}
            icon={Wrench}
            iconBg="bg-rose-100 dark:bg-rose-900/30"
            iconColor="text-rose-500 dark:text-rose-400"
            variants={itemVariants}
          />
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 dark:text-white">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resource</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            <Box size={16} />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{booking.resource_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            {booking.user_name.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{booking.user_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{formatDate(booking.start_datetime)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-12 text-center">
                <CalendarCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No bookings yet</p>
                <Link href="/dashboard/bookings" className="text-sm text-violet-600 dark:text-violet-400 font-medium mt-1 inline-block hover:underline">
                  Create your first booking →
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-5">
          {/* Quick Overview */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Quick Overview</h2>
            <div className="space-y-3">
              {isAdmin && (
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Pending Approvals</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Awaiting your review</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats?.pendingBookings ?? 0}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Active Maintenance</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled or in-progress</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{stats?.activeMaintenanceCount ?? 0}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/dashboard/bookings" className="py-2.5 text-sm font-medium text-center text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
                {isAdmin ? "Review Bookings" : "My Bookings"}
              </Link>
              <Link href="/dashboard/maintenance" className="py-2.5 text-sm font-medium text-center text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors">
                Maintenance
              </Link>
            </div>
          </motion.div>

          {/* Resources Summary Card */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-700 dark:to-violet-800 rounded-2xl p-5 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-indigo-200 text-xs font-medium">Total Resources</p>
                <span className="text-3xl font-bold mt-1 block">{stats?.totalResources ?? 0}</span>
              </div>
              <div className="bg-white/15 p-2 rounded-lg">
                <ArrowUpRight size={20} />
              </div>
            </div>
            {isAdmin ? (
              <Link href="/dashboard/resources" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-200 hover:text-white transition-colors">
                Manage Resources <ChevronRight size={14} />
              </Link>
            ) : (
              <Link href="/dashboard/bookings" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-200 hover:text-white transition-colors">
                Book a Resource <ChevronRight size={14} />
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  variants: Record<string, unknown>;
  highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, variants, highlight }: StatCardProps) {
  return (
    <motion.div
      variants={variants}
      className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${highlight ? "border-amber-300 dark:border-amber-700" : "border-slate-200 dark:border-slate-700"
        }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <span className="text-2xl font-bold text-slate-800 dark:text-white block">{value.toLocaleString()}</span>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
    </motion.div>
  );
}
