"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import {
  Users,
  Box,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreHorizontal,
  ChevronRight
} from "lucide-react";

// Chart data
const chartData = [
  { value: 65, label: "Jan" },
  { value: 45, label: "Feb" },
  { value: 78, label: "Mar" },
  { value: 52, label: "Apr" },
  { value: 88, label: "May" },
  { value: 72, label: "Jun" },
  { value: 95, label: "Jul" },
  { value: 68, label: "Aug" },
  { value: 42, label: "Sep" },
  { value: 75, label: "Oct" },
  { value: 58, label: "Nov" },
  { value: 82, label: "Dec" },
];

const bookingsData = [
  { resource: "Projector A1", user: "Sarah Smith", date: "Today, 10:00 AM", status: "Active", type: "tech" },
  { resource: "Conference Room B", user: "Mike Johnson", date: "Today, 02:00 PM", status: "Pending", type: "room" },
  { resource: "Lab Equipment 04", user: "Alex Wilson", date: "Yesterday", status: "Completed", type: "lab" },
  { resource: "Camera Canon EOS", user: "Emily Brown", date: "Jan 23, 2026", status: "Active", type: "tech" },
];

const scheduleData = [
  { title: "Team Standup", time: "10:00 - 10:30 AM", location: "Room A", color: "violet" },
  { title: "Project Review", time: "02:00 - 03:00 PM", location: "Zoom Call", color: "sky" },
  { title: "Client Presentation", time: "04:30 - 05:30 PM", location: "Room B", color: "indigo" },
];

export default function DashboardPage() {
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
          <span className="text-2xl font-semibold text-slate-800 dark:text-white">Dashboard</span>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Welcome back! Here&apos;s your resource overview.</p>
        </div>
        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-lg shadow-sm">
          <button className="px-3 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-md">Today</button>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Week</button>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Month</button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Resources"
          value="1,248"
          change="+12%"
          positive
          icon={Box}
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          iconColor="text-violet-600 dark:text-violet-400"
          variants={itemVariants}
        />
        <StatCard
          title="Active Bookings"
          value="86"
          change="+4.5%"
          positive
          icon={CalendarCheck}
          iconBg="bg-sky-100 dark:bg-sky-900/30"
          iconColor="text-sky-600 dark:text-sky-400"
          variants={itemVariants}
        />
        <StatCard
          title="In Maintenance"
          value="12"
          change="-2"
          positive={false}
          icon={AlertTriangle}
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-500 dark:text-rose-400"
          variants={itemVariants}
        />
        <StatCard
          title="Total Users"
          value="2,845"
          change="+18%"
          positive
          icon={Users}
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400"
          variants={itemVariants}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <span className="font-semibold text-slate-800 dark:text-white">Booking Analytics</span>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="flex items-end gap-2 h-48">
              {chartData.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-40 bg-slate-100 dark:bg-slate-700 rounded flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${item.value}%` }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                      className={`w-full rounded ${i % 3 === 0 ? 'bg-violet-500' : i % 3 === 1 ? 'bg-sky-500' : 'bg-indigo-500'}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-white">Recent Bookings</span>
              <button className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Resource</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">User</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsData.map((booking, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${booking.type === 'tech' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' :
                              booking.type === 'room' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' :
                                'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            }`}>
                            <Box size={16} />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{booking.resource}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {booking.user.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{booking.user}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{booking.date}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${booking.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            booking.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                              'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Schedule */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="font-semibold text-slate-800 dark:text-white mb-4 block">Today&apos;s Schedule</span>
            <div className="space-y-4">
              {scheduleData.map((event, i) => (
                <div key={i} className="flex gap-3 group cursor-pointer">
                  <div className="flex flex-col items-center pt-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${event.color === 'violet' ? 'bg-violet-500' :
                        event.color === 'sky' ? 'bg-sky-500' : 'bg-indigo-500'
                      }`} />
                    {i !== scheduleData.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-slate-700 dark:text-slate-200 text-sm group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={11} />
                      <span>{event.time}</span>
                    </div>
                    <span className="inline-block mt-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                      {event.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-2 py-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
              View Calendar
            </button>
          </motion.div>

          {/* Stats Card */}
          <motion.div variants={itemVariants} className="bg-indigo-600 dark:bg-indigo-700 rounded-xl p-5 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-indigo-200 text-xs font-medium">Monthly Savings</p>
                <span className="text-2xl font-bold mt-1 block">$12,450</span>
              </div>
              <div className="bg-white/15 p-2 rounded-lg">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-indigo-200">Target: $15,000</span>
                <span className="font-semibold">82%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "82%" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-sky-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  variants: Variants;
}

function StatCard({ title, value, change, positive, icon: Icon, iconBg, iconColor, variants }: StatCardProps) {
  return (
    <motion.div
      variants={variants}
      className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <span className="text-2xl font-bold text-slate-800 dark:text-white block">{value}</span>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
    </motion.div>
  );
}
