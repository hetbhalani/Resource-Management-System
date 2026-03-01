"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Box,
  CalendarCheck,
  AlertTriangle,
  Users,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Wrench,
  Shield,
  CalendarDays,
  TrendingUp,
  MapPin,
  Activity,
  PieChart as PieChartIcon
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/UserProvider";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

/* ── Animated Number ────────────────────────── */
function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => Math.round(v).toLocaleString());
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasAnimated || value === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          animate(motionVal, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated, motionVal]);

  if (value === 0) return <span>0</span>;

  return <motion.span ref={ref}>{display}</motion.span>;
}

/* ── Admin stats interface ─────────────────── */
interface AdminStats {
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
  bookingsByStatus: {
    approved: number;
    pending: number;
    rejected: number;
    cancelled: number;
  };
  weeklyTrend: {
    week: string;
    bookings: number;
    approved: number;
  }[];
  resourceTypeDistribution: {
    name: string;
    value: number;
  }[];
}

/* ── Student/Faculty stats interface ───────── */
interface UserStats {
  myTotalBookings: number;
  myPendingBookings: number;
  myUpcomingBookings: number;
  myRecentBookings: {
    booking_id: number;
    resource_name: string;
    building_name: string;
    floor_number: number | null;
    start_datetime: string;
    end_datetime: string;
    status: string;
    created_at: string;
  }[];
}

export default function DashboardPage() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          if (isAdmin) setAdminStats(data);
          else setUserStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user, isAdmin]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 150, damping: 18 }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse">
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700 rounded-xl mb-3" />
              <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mb-1" />
              <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-72 animate-pulse" />
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-72 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AdminDashboard
        stats={adminStats}
        user={user}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />
    );
  }

  return (
    <UserDashboard
      stats={userStats}
      user={user}
      containerVariants={containerVariants}
      itemVariants={itemVariants}
    />
  );
}

/* ═══════════════════════════════════════════
   CHART COLORS
   ═══════════════════════════════════════════ */
const STATUS_COLORS: Record<string, string> = {
  approved: "#10b981",
  pending: "#f59e0b",
  rejected: "#f43f5e",
  cancelled: "#94a3b8",
};

const RESOURCE_TYPE_COLORS = [
  "#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#14b8a6",
  "#22c55e", "#eab308", "#f97316", "#ef4444", "#ec4899",
];

/* ════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ════════════════════════════════════════════════════ */
interface AdminDashboardProps {
  stats: AdminStats | null;
  user: { name: string; role: string } | null;
  containerVariants: Record<string, unknown>;
  itemVariants: Record<string, unknown>;
}

function AdminDashboard({ stats, user, containerVariants, itemVariants }: AdminDashboardProps) {
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
      case "approved": return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/10";
      case "pending": return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/10";
      case "rejected": return "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/10";
      case "cancelled": return "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
      default: return "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
    }
  };

  // Pie chart data
  const statusPieData = useMemo(() => {
    if (!stats?.bookingsByStatus) return [];
    return Object.entries(stats.bookingsByStatus)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: key, value }));
  }, [stats?.bookingsByStatus]);

  const totalStatusBookings = statusPieData.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Manage resources and review booking requests.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
          <Shield size={14} className="text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Admin Panel</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Resources" value={stats?.totalResources ?? 0} icon={Box}
          gradient="from-violet-500 to-purple-600" variants={itemVariants} />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={CalendarCheck}
          gradient="from-sky-500 to-cyan-600" variants={itemVariants} />
        <StatCard title="Pending Approvals" value={stats?.pendingBookings ?? 0} icon={AlertTriangle}
          gradient="from-amber-500 to-orange-500" variants={itemVariants}
          highlight={!!stats?.pendingBookings} />
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={Users}
          gradient="from-indigo-500 to-blue-600" variants={itemVariants} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Booking Trend Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20">
                <Activity size={15} className="text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-white text-sm">Booking Trend</h2>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Last 8 weeks</span>
          </div>
          <div className="px-3 pt-4 pb-2 h-[260px]">
            {stats?.weeklyTrend && stats.weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyTrend} margin={{ top: 5, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200, #e2e8f0)" opacity={0.4} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      padding: "8px 12px",
                    }}
                    itemStyle={{ padding: "2px 0" }}
                    labelStyle={{ fontWeight: 600, color: "#334155", marginBottom: "4px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#bookingsGrad)"
                    name="Total Bookings"
                    dot={{ fill: "#6366f1", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#approvedGrad)"
                    name="Approved"
                    dot={false}
                    strokeDasharray="4 2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">No data available</div>
            )}
          </div>
        </motion.div>

        {/* Booking Status Donut */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20">
              <PieChartIcon size={15} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm">Bookings by Status</h2>
          </div>
          <div className="px-5 py-4 flex flex-col items-center">
            {statusPieData.length > 0 ? (
              <>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={3}
                      >
                        {statusPieData.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                        formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 w-full">
                  {statusPieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] }} />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{entry.name}</span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 ml-auto tabular-nums">
                        {totalStatusBookings > 0 ? Math.round((entry.value / totalStatusBookings) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-sm text-slate-400">No data</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Table + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 dark:text-white">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 transition-colors">
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
                  {stats.recentBookings.map((booking, i) => (
                    <motion.tr
                      key={booking.booking_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(booking.status)}`}>
                          {booking.status === "pending" && <span className="status-dot status-dot-pending" />}
                          {booking.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-5 py-12 text-center">
                <CalendarCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No bookings yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Resource Type Distribution */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">Resource Types</h2>
            {stats?.resourceTypeDistribution && stats.resourceTypeDistribution.length > 0 ? (
              <div className="space-y-2.5">
                {stats.resourceTypeDistribution.map((rt, idx) => {
                  const maxVal = Math.max(...stats.resourceTypeDistribution.map(r => r.value), 1);
                  const pct = (rt.value / maxVal) * 100;
                  const color = RESOURCE_TYPE_COLORS[idx % RESOURCE_TYPE_COLORS.length];
                  return (
                    <div key={rt.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 capitalize">{rt.name}</span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{rt.value}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No resource types</p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">Quick Overview</h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Pending</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Awaiting review</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats?.pendingBookings ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                    <Wrench size={16} className="text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Maintenance</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Active records</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{stats?.activeMaintenanceCount ?? 0}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/dashboard/bookings" className="py-2.5 text-sm font-medium text-center text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors active:scale-[0.98]">
                Review Bookings
              </Link>
              <Link href="/dashboard/maintenance" className="py-2.5 text-sm font-medium text-center text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors active:scale-[0.98]">
                Maintenance
              </Link>
            </div>
          </motion.div>

          {/* CTA Card */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-700 dark:to-violet-800 rounded-2xl p-5 text-white relative overflow-hidden card-interactive">
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                <p className="text-indigo-200 text-xs font-medium">Total Resources</p>
                <span className="text-3xl font-bold mt-1 block">{stats?.totalResources ?? 0}</span>
              </div>
              <div className="bg-white/15 p-2 rounded-lg">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <Link href="/dashboard/resources" className="relative z-10 inline-flex items-center gap-1 text-sm font-medium text-indigo-200 hover:text-white transition-colors">
              Manage Resources <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════
   STUDENT / FACULTY DASHBOARD
   ════════════════════════════════════════════════════ */
interface UserDashboardProps {
  stats: UserStats | null;
  user: { name: string; role: string } | null;
  containerVariants: Record<string, unknown>;
  itemVariants: Record<string, unknown>;
}

function UserDashboard({ stats, user, containerVariants, itemVariants }: UserDashboardProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/10";
      case "pending": return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/10";
      case "rejected": return "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/10";
      case "cancelled": return "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
      default: return "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
  };

  const activeBookings = stats?.myRecentBookings?.filter(
    b => b.status === "pending" || (b.status === "approved" && new Date(b.start_datetime) >= new Date())
  ) ?? [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Welcome, {user?.name?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Book resources and track your reservations.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${user?.role === "faculty"
          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
          : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
          }`}>
          <span className={`text-xs font-semibold capitalize ${user?.role === "faculty"
            ? "text-indigo-700 dark:text-indigo-400"
            : "text-emerald-700 dark:text-emerald-400"
            }`}>{user?.role}</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Bookings" value={stats?.myTotalBookings ?? 0} icon={CalendarCheck}
          gradient="from-violet-500 to-purple-600" variants={itemVariants} />
        <StatCard title="Pending Approval" value={stats?.myPendingBookings ?? 0} icon={Clock}
          gradient="from-amber-500 to-orange-500" variants={itemVariants}
          highlight={!!stats?.myPendingBookings} />
        <StatCard title="Upcoming" value={stats?.myUpcomingBookings ?? 0} icon={TrendingUp}
          gradient="from-sky-500 to-cyan-600" variants={itemVariants} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active / Pending Bookings List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 dark:text-white">My Active Bookings</h2>
            <Link href="/dashboard/bookings" className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 transition-colors">
              View Timetable <ChevronRight size={14} />
            </Link>
          </div>
          {activeBookings.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {activeBookings.map((booking, i) => (
                <motion.div
                  key={booking.booking_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Box size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{booking.resource_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin size={11} className="text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {booking.building_name}{booking.floor_number ? `, Floor ${booking.floor_number}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(booking.status)}`}>
                        {booking.status === "pending" && <span className="status-dot status-dot-pending" />}
                        {booking.status}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(booking.start_datetime)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No active bookings</p>
              <Link href="/dashboard/bookings" className="text-sm text-violet-600 dark:text-violet-400 font-medium mt-1 inline-block hover:underline">
                Book a resource →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Right Column — Quick Actions */}
        <div className="space-y-5">
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-violet-700 dark:to-indigo-800 rounded-2xl p-5 text-white relative overflow-hidden card-interactive">
            <div className="relative z-10 flex justify-between items-start mb-3">
              <div>
                <p className="text-violet-200 text-xs font-medium">Quick Action</p>
                <h3 className="text-lg font-bold mt-1">Book a Resource</h3>
              </div>
              <div className="bg-white/15 p-2 rounded-lg">
                <CalendarDays size={20} />
              </div>
            </div>
            <p className="relative z-10 text-violet-200 text-sm mb-4">
              Open the weekly timetable to select a time slot and book a classroom or lab.
            </p>
            <Link href="/dashboard/bookings" className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors active:scale-[0.98]">
              Open Timetable <ChevronRight size={14} />
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Booking Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Pending</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Awaiting admin approval</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats?.myPendingBookings ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <CalendarCheck size={16} className="text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Upcoming</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Approved & scheduled</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{stats?.myUpcomingBookings ?? 0}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Shared StatCard ─────────────────────── */
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  variants: Record<string, unknown>;
  highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, gradient, variants, highlight }: StatCardProps) {
  return (
    <motion.div
      variants={variants}
      className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 card-interactive ${highlight ? "border-amber-300 dark:border-amber-700" : "border-slate-200 dark:border-slate-700"
        }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <span className="text-2xl font-bold text-slate-800 dark:text-white block tabular-nums">
        <AnimatedNumber value={value} />
      </span>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{title}</p>
    </motion.div>
  );
}
