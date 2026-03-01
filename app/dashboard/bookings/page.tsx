"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Search, Check, X, Ban, Loader2, Box, Clock, Shield,
    ChevronLeft, ChevronRight, Building2, Layers, MapPin, Info,
    Wifi, Monitor, Projector, Wind, Zap, Coffee
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

/* ── Types ──────────────────────────────── */
interface Booking {
    booking_id: number;
    resource_id: number;
    user_id: number;
    start_datetime: string;
    end_datetime: string;
    status: string;
    approver_id: number | null;
    created_at: string;
    resources: { resource_id: number; resource_name: string };
    users_bookings_user_idTousers: { user_id: number; name: string; email: string };
    users_bookings_approver_idTousers: { user_id: number; name: string } | null;
}

interface Building {
    building_id: number;
    building_name: string;
    building_number: string | null;
    total_floors: number | null;
}

interface Facility {
    facility_id: number;
    resource_id: number;
    facility_name: string;
    details: string | null;
}

interface Resource {
    resource_id: number;
    resource_name: string;
    floor_number: number | null;
    description: string | null;
    resource_types: { type_name: string };
    buildings: { building_name: string };
    facilities?: Facility[];
}

/* ── Time slots ─────────────────────────── */
const TIME_SLOTS = [
    { label: "7:45 – 9:30", startH: 7, startM: 45, endH: 9, endM: 30 },
    { label: "9:50 – 11:30", startH: 9, startM: 50, endH: 11, endM: 30 },
    { label: "12:10 – 1:50", startH: 12, startM: 10, endH: 13, endM: 50 },
];

// Mon–Sat only
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ── Helpers ─────────────────────────────── */
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatWeekRange(weekStart: Date): string {
    const end = addDays(weekStart, 5); // Sat
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function slotsOverlap(bookingStart: Date, bookingEnd: Date, dayDate: Date, slot: typeof TIME_SLOTS[0]): boolean {
    const slotStart = new Date(dayDate);
    slotStart.setHours(slot.startH, slot.startM, 0, 0);
    const slotEnd = new Date(dayDate);
    slotEnd.setHours(slot.endH, slot.endM, 0, 0);
    return bookingStart < slotEnd && bookingEnd > slotStart;
}

function getFacilityIcon(name: string) {
    const n = name.toLowerCase();
    if (n.includes("wifi") || n.includes("internet")) return Wifi;
    if (n.includes("projector")) return Projector;
    if (n.includes("computer") || n.includes("monitor") || n.includes("pc")) return Monitor;
    if (n.includes("ac") || n.includes("air")) return Wind;
    if (n.includes("power") || n.includes("charging")) return Zap;
    if (n.includes("water") || n.includes("drink") || n.includes("coffee")) return Coffee;
    return Info;
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useUser();

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch("/api/bookings");
            if (res.ok) setBookings(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-96 animate-pulse" />
            </div>
        );
    }

    if (isAdmin) {
        return <AdminBookingsView bookings={bookings} user={user} fetchBookings={fetchBookings} />;
    }

    return <TimetableBookingsView bookings={bookings} user={user} fetchBookings={fetchBookings} />;
}

/* ══════════════════════════════════════════
   ADMIN BOOKINGS VIEW
   ══════════════════════════════════════════ */
interface AdminBookingsViewProps {
    bookings: Booking[];
    user: { userId: string; name: string; role: string } | null;
    fetchBookings: () => Promise<void>;
}

function AdminBookingsView({ bookings, user, fetchBookings }: AdminBookingsViewProps) {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
        try {
            const body: Record<string, unknown> = { status: newStatus };
            if (newStatus === "approved" || newStatus === "rejected") {
                body.approver_id = Number(user?.userId);
            }
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                toast.success(`Booking ${newStatus}`);
                fetchBookings();
            }
        } catch { toast.error("Update failed"); }
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

    const formatDateTime = (dt: string) => {
        return new Date(dt).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit", hour12: true,
        });
    };

    const filtered = bookings.filter(b => {
        const matchSearch = b.resources.resource_name.toLowerCase().includes(search.toLowerCase()) ||
            b.users_bookings_user_idTousers.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || b.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Bookings</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <Shield size={12} className="text-rose-600 dark:text-rose-400" />
                            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Approval View</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        Review and approve booking requests from students and faculty.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by resource or user..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all duration-200" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all duration-200">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {filtered.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resource</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Booked By</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">End</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map((b, i) => {
                                    const canApprove = b.status === "pending";
                                    return (
                                        <motion.tr
                                            key={b.booking_id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.25 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                                        <Box size={16} className="text-violet-600 dark:text-violet-400" />
                                                    </div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{b.resources.resource_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                                        {b.users_bookings_user_idTousers.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">{b.users_bookings_user_idTousers.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> {formatDateTime(b.start_datetime)}</div>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(b.end_datetime)}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(b.status)}`}>
                                                    {b.status === "pending" && <span className="status-dot status-dot-pending" />}
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {canApprove ? (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(b.booking_id, "approved")}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-200 active:scale-95" title="Approve">
                                                                <Check size={14} /> Approve
                                                            </button>
                                                            <button onClick={() => handleStatusUpdate(b.booking_id, "rejected")}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-all duration-200 active:scale-95" title="Reject">
                                                                <X size={14} /> Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {search || filterStatus ? "No bookings match your search." : "No booking requests yet."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════
   TIMETABLE VIEW (Student / Faculty)
   ══════════════════════════════════════════ */
interface TimetableBookingsViewProps {
    bookings: Booking[];
    user: { userId: string; name: string; role: string } | null;
    fetchBookings: () => Promise<void>;
}

function TimetableBookingsView({ bookings, user, fetchBookings }: TimetableBookingsViewProps) {
    const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
    const [showPopup, setShowPopup] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ dayIndex: number; slotIndex: number } | null>(null);
    const [weekDirection, setWeekDirection] = useState(0);

    // ALL bookings — used to check conflicts for ALL users
    const allActiveBookings = bookings.filter(b => b.status === "pending" || b.status === "approved");

    // Only current user's bookings — used to display in the timetable
    const myBookings = bookings.filter(b => Number(b.user_id) === Number(user?.userId));

    const handleCellClick = (dayIndex: number, slotIndex: number) => {
        setSelectedSlot({ dayIndex, slotIndex });
        setShowPopup(true);
    };

    const handleBookingCreated = () => {
        setShowPopup(false);
        setSelectedSlot(null);
        fetchBookings();
    };


    const handleCancel = async (bookingId: number) => {
        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" }),
            });
            if (res.ok) {
                toast.success("Booking cancelled");
                fetchBookings();
            }
        } catch { toast.error("Cancel failed"); }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const navigateWeek = (direction: number) => {
        setWeekDirection(direction);
        setWeekStart(addDays(weekStart, direction * 7));
    };

    // Get bookings for a specific resource+slot across ALL users (for conflict check in popup)
    const getConflictingBookingsForSlot = (dayDate: Date, slot: typeof TIME_SLOTS[0]) => {
        return allActiveBookings.filter(b => {
            const bStart = new Date(b.start_datetime);
            const bEnd = new Date(b.end_datetime);
            return slotsOverlap(bStart, bEnd, dayDate, slot);
        });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Weekly Timetable</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        Select an available slot to book a resource
                    </p>
                </div>
            </div>

            {/* Week Navigator */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm">
                <button onClick={() => navigateWeek(-1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-400 active:scale-90">
                    <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={weekStart.toISOString()}
                            initial={{ opacity: 0, x: weekDirection * 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: weekDirection * -20 }}
                            transition={{ duration: 0.2 }}
                            className="text-sm font-semibold text-slate-800 dark:text-white"
                        >
                            {formatWeekRange(weekStart)}
                        </motion.p>
                    </AnimatePresence>
                    <button onClick={() => { setWeekDirection(0); setWeekStart(getWeekStart(new Date())); }}
                        className="text-[11px] text-violet-600 dark:text-violet-400 font-medium hover:underline mt-0.5">
                        Go to today
                    </button>
                </div>
                <button onClick={() => navigateWeek(1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-400 active:scale-90">
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                        <thead>
                            <tr>
                                <th className="px-3 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 border-b border-r border-slate-200 dark:border-slate-700 w-28">
                                    Time Slot
                                </th>
                                {DAY_NAMES.map((day, idx) => {
                                    const dayDate = addDays(weekStart, idx);
                                    const isToday = dayDate.toDateString() === new Date().toDateString();
                                    return (
                                        <th key={day} className={`px-2 py-4 text-center border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700 ${isToday ? "bg-violet-50 dark:bg-violet-900/15" : "bg-slate-50 dark:bg-slate-900/50"}`}>
                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"}`}>{day}</span>
                                            <p className={`text-[11px] mt-0.5 tabular-nums ${isToday ? "text-violet-500 dark:text-violet-400 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                                                {dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </p>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((slot, slotIdx) => (
                                <tr key={slotIdx}>
                                    <td className="px-3 py-3 border-r border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 align-middle">
                                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap leading-tight">
                                            {slot.label.split(" – ")[0]}
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                            to {slot.label.split(" – ")[1]}
                                        </p>
                                    </td>
                                    {DAY_NAMES.map((_, dayIdx) => {
                                        const dayDate = addDays(weekStart, dayIdx);
                                        const isToday = dayDate.toDateString() === new Date().toDateString();
                                        const isPast = dayDate < today;

                                        // Show only MY bookings in the timetable
                                        const cellBooking = myBookings.find(b => {
                                            const bStart = new Date(b.start_datetime);
                                            const bEnd = new Date(b.end_datetime);
                                            return slotsOverlap(bStart, bEnd, dayDate, slot) && b.status !== "rejected" && b.status !== "cancelled";
                                        });

                                        const cellBg = isToday ? "bg-violet-50/30 dark:bg-violet-900/5" : "";

                                        if (cellBooking) {
                                            const statusColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
                                                approved: {
                                                    bg: "bg-emerald-50 dark:bg-emerald-900/15",
                                                    border: "border-emerald-200 dark:border-emerald-800",
                                                    text: "text-emerald-700 dark:text-emerald-400",
                                                    badge: "bg-emerald-100 dark:bg-emerald-900/30"
                                                },
                                                pending: {
                                                    bg: "bg-amber-50 dark:bg-amber-900/15",
                                                    border: "border-amber-200 dark:border-amber-800",
                                                    text: "text-amber-700 dark:text-amber-400",
                                                    badge: "bg-amber-100 dark:bg-amber-900/30"
                                                },
                                            };
                                            const c = statusColors[cellBooking.status] || statusColors.pending;

                                            return (
                                                <td key={dayIdx} className={`border-r border-b last:border-r-0 border-slate-200 dark:border-slate-700 p-1.5 ${cellBg}`}>
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className={`rounded-xl border ${c.border} ${c.bg} h-[110px] p-3 flex flex-col justify-between relative group transition-shadow hover:shadow-md`}
                                                    >
                                                        <div>
                                                            <p className={`text-[11px] font-bold truncate ${c.text}`}>
                                                                {cellBooking.resources.resource_name}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${c.text} ${c.badge}`}>
                                                                {cellBooking.status === "pending" && <span className="status-dot status-dot-pending" style={{ width: 5, height: 5 }} />}
                                                                {cellBooking.status}
                                                            </span>
                                                        </div>
                                                        {/* Hover cancel */}
                                                        {(cellBooking.status === "pending" || cellBooking.status === "approved") && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleCancel(cellBooking.booking_id); }}
                                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-200 active:scale-90 cursor-pointer"
                                                                title="Cancel booking"
                                                            >
                                                                <Ban size={12} className="text-rose-500 dark:text-rose-400" />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={dayIdx} className={`border-r border-b last:border-r-0 border-slate-200 dark:border-slate-700 p-1.5 ${cellBg}`}>
                                                <button
                                                    onClick={() => !isPast && handleCellClick(dayIdx, slotIdx)}
                                                    disabled={isPast}
                                                    className={`w-full rounded-xl border border-dashed h-[110px] flex flex-col items-center justify-center gap-1 transition-all duration-200 ${isPast
                                                        ? "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 cursor-not-allowed"
                                                        : "border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/60 dark:hover:bg-violet-900/10 cursor-pointer group active:scale-[0.98]"
                                                        }`}
                                                >
                                                    {!isPast && (
                                                        <>
                                                            <span className="text-lg text-slate-300 group-hover:text-violet-500 dark:text-slate-600 dark:group-hover:text-violet-400 transition-colors font-light leading-none">+</span>
                                                            <span className="text-[9px] font-medium text-slate-300 group-hover:text-violet-500 dark:text-slate-600 dark:group-hover:text-violet-400 transition-colors uppercase tracking-wider">
                                                                Book
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-200" />
                    Pending
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200" />
                    Approved
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded border border-dashed border-slate-300 dark:border-slate-600" />
                    Available
                </div>
            </div>

            {/* Resource Selection Popup */}
            <AnimatePresence>
                {showPopup && selectedSlot && (
                    <ResourceSelectionPopup
                        dayDate={addDays(weekStart, selectedSlot.dayIndex)}
                        slot={TIME_SLOTS[selectedSlot.slotIndex]}
                        conflictingBookings={getConflictingBookingsForSlot(
                            addDays(weekStart, selectedSlot.dayIndex),
                            TIME_SLOTS[selectedSlot.slotIndex]
                        )}
                        onClose={() => { setShowPopup(false); setSelectedSlot(null); }}
                        onBooked={handleBookingCreated}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ══════════════════════════════════════════
   RESOURCE SELECTION POPUP (3-step wizard)
   ══════════════════════════════════════════ */
interface ResourceSelectionPopupProps {
    dayDate: Date;
    slot: typeof TIME_SLOTS[0];
    conflictingBookings: Booking[];
    onClose: () => void;
    onBooked: () => void;
}

function ResourceSelectionPopup({ dayDate, slot, conflictingBookings, onClose, onBooked }: ResourceSelectionPopupProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [loadingBuildings, setLoadingBuildings] = useState(true);
    const [loadingResources, setLoadingResources] = useState(false);
    const [submittingId, setSubmittingId] = useState<number | null>(null);

    // Resource IDs that are already booked for this time slot
    const bookedResourceIds = new Set(conflictingBookings.map(b => b.resource_id));

    useEffect(() => {
        fetch("/api/buildings")
            .then(r => r.json())
            .then(setBuildings)
            .catch(console.error)
            .finally(() => setLoadingBuildings(false));
    }, []);

    useEffect(() => {
        if (selectedBuilding && selectedFloor !== null) {
            setLoadingResources(true);
            fetch(`/api/resources/by-location?building_id=${selectedBuilding.building_id}&floor_number=${selectedFloor}`)
                .then(r => r.json())
                .then(setResources)
                .catch(console.error)
                .finally(() => setLoadingResources(false));
        }
    }, [selectedBuilding, selectedFloor]);

    const handleSelectBuilding = (building: Building) => {
        setSelectedBuilding(building);
        setStep(2);
    };

    const handleSelectFloor = (floor: number) => {
        setSelectedFloor(floor);
        setStep(3);
    };

    const handleSubmitBooking = async (resourceId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSubmittingId(resourceId);
        try {
            const startDatetime = new Date(dayDate);
            startDatetime.setHours(slot.startH, slot.startM, 0, 0);
            const endDatetime = new Date(dayDate);
            endDatetime.setHours(slot.endH, slot.endM, 0, 0);

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resource_id: resourceId,
                    start_datetime: startDatetime.toISOString(),
                    end_datetime: endDatetime.toISOString(),
                }),
            });

            if (res.ok) {
                toast.success("Booking submitted!");
                onBooked();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create booking");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSubmittingId(null);
        }
    };

    const formattedDate = dayDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative z-10 w-full max-w-xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800 dark:text-white">Select Resource</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {formattedDate} • {slot.label}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-3">
                        {[
                            { num: 1, label: "Building" },
                            { num: 2, label: "Floor" },
                            { num: 3, label: "Resource" }
                        ].map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <button
                                    onClick={() => {
                                        if (s.num === 1) { setStep(1); setSelectedBuilding(null); setSelectedFloor(null); }
                                        else if (s.num === 2 && selectedBuilding) { setStep(2); setSelectedFloor(null); }
                                    }}
                                    disabled={s.num > step}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${step === s.num
                                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400"
                                        : step > s.num
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 cursor-pointer"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                        }`}
                                >
                                    {step > s.num ? <Check size={11} /> : <span className="w-3.5 h-3.5 rounded-full bg-current/20 flex items-center justify-center text-[9px]">{s.num}</span>}
                                    {s.label}
                                </button>
                                {idx < 2 && (
                                    <div className={`flex-1 h-px transition-colors duration-300 ${step > idx + 1 ? "bg-emerald-300 dark:bg-emerald-700" : "bg-slate-200 dark:bg-slate-700"}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4 max-h-[50vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Buildings */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.2 }} className="space-y-2">
                                {loadingBuildings ? (
                                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-violet-600" /></div>
                                ) : buildings.length > 0 ? (
                                    buildings.map((b, i) => (
                                        <motion.button key={b.building_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            onClick={() => handleSelectBuilding(b)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200 text-left active:scale-[0.98]">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Building2 size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{b.building_name}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {b.building_number ? `#${b.building_number} • ` : ""}{b.total_floors ?? 0} floors
                                                </p>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-400" />
                                        </motion.button>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-slate-500 py-8">No buildings available</p>
                                )}
                            </motion.div>
                        )}

                        {/* Step 2: Floors */}
                        {step === 2 && selectedBuilding && (
                            <motion.div key="step2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.2 }} className="space-y-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{selectedBuilding.building_name}</span> — Select a floor
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {Array.from({ length: selectedBuilding.total_floors ?? 1 }, (_, i) => i + 1).map((floor, fi) => (
                                        <motion.button key={floor} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: fi * 0.04 }}
                                            onClick={() => handleSelectFloor(floor)}
                                            className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200 active:scale-95">
                                            <Layers size={16} className="text-slate-500 dark:text-slate-400" />
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Floor {floor}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Resources with facilities */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.2 }} className="space-y-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{selectedBuilding?.building_name}</span>
                                    {" "} • Floor {selectedFloor}
                                </p>
                                {loadingResources ? (
                                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-violet-600" /></div>
                                ) : resources.length > 0 ? (
                                    resources.map((r, ri) => {
                                        const isBooked = bookedResourceIds.has(r.resource_id);
                                        const facilities = r.facilities || [];

                                        return (
                                            <motion.div
                                                key={r.resource_id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: ri * 0.04 }}
                                                className={`rounded-xl border overflow-hidden transition-all duration-200 ${isBooked
                                                    ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 opacity-60"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 p-3.5">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isBooked
                                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                        : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                                        }`}>
                                                        <MapPin size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium ${isBooked ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-700 dark:text-slate-200"}`}>
                                                            {r.resource_name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                            {r.resource_types.type_name}{r.description ? ` • ${r.description}` : ""}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {isBooked ? (
                                                            <span className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg">
                                                                Booked
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => handleSubmitBooking(r.resource_id, e)}
                                                                disabled={submittingId !== null}
                                                                className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-3 py-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                                                            >
                                                                {submittingId === r.resource_id ? <Loader2 size={13} className="animate-spin" /> : "Book"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Facilities — always visible */}
                                                {facilities.length > 0 && (
                                                    <div className="border-t border-slate-100 dark:border-slate-700">
                                                        <div className="px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900/30">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {facilities.map((f) => {
                                                                    const FIcon = getFacilityIcon(f.facility_name);
                                                                    return (
                                                                        <div key={f.facility_id}
                                                                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 font-medium"
                                                                            title={f.details || f.facility_name}
                                                                        >
                                                                            <FIcon size={11} className="text-indigo-500 dark:text-indigo-400" />
                                                                            {f.facility_name}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8">
                                        <Box className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No resources on this floor</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    {step > 1 ? (
                        <button
                            onClick={() => {
                                if (step === 3) { setStep(2); setSelectedFloor(null); }
                                else if (step === 2) { setStep(1); setSelectedBuilding(null); }
                            }}
                            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
                        >
                            ← Back
                        </button>
                    ) : <div />}
                    <button onClick={onClose} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
