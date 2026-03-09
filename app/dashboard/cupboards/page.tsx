"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Search, Check, X, Shield,
    ChevronLeft, ChevronRight, Building2, Layers, Package,
    CheckCircle, XCircle, Info, Loader2, Plus, Pencil, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

/* ── Types ──────────────────────────────── */
interface Cupboard {
    cupboard_id: number;
    resource_id: number;
    cupboard_name: string;
    total_shelves: number;
    user_id: number | null;
    is_booked: boolean;
    booked_date: string | null;
    resources: {
        resource_name: string;
        building_id: number;
        floor_number: number | null;
        buildings: { building_name: string };
    };
    users: { name: string; email: string } | null;
}

interface Building {
    building_id: number;
    building_name: string;
    building_number: string | null;
    total_floors: number | null;
}

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

export default function CupboardsPage() {
    const { isAdmin } = useUser();
    if (isAdmin) return <AdminCupboardsView />;
    return <BookingView />;
}

function BookingView() {
    const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
    const [weekDirection, setWeekDirection] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [myBookedDates, setMyBookedDates] = useState<Set<string>>(new Set());

    const { user } = useUser();

    const fetchMyBookings = useCallback(async () => {
        if (!user?.userId) return;
        try {
            const res = await fetch("/api/cupboards/my-bookings", {
                headers: { 'x-user-id': user.userId }
            });
            const dates = await res.json();
            if (Array.isArray(dates)) {
                setMyBookedDates(new Set(dates.map((d: string) => new Date(d).toISOString().split('T')[0])));
            }
        } catch (e) { console.error(e); }
    }, [user?.userId]);

    useEffect(() => { fetchMyBookings(); }, [fetchMyBookings]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const navigateWeek = (direction: number) => {
        setWeekDirection(direction);
        setWeekStart(addDays(weekStart, direction * 7));
    };

    const handleDayClick = (dayDate: Date) => {
        setSelectedDate(dayDate);
        setShowPopup(true);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Cupboards Booking</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        Select an available day to book a cupboard
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

            {/* Timetable Grid (Single row for full days) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                        <thead>
                            <tr>
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
                            <tr>
                                {DAY_NAMES.map((_, dayIdx) => {
                                    const dayDate = addDays(weekStart, dayIdx);
                                    const dateStr = dayDate.toISOString().split('T')[0];
                                    const isToday = dayDate.toDateString() === new Date().toDateString();
                                    const isPast = dayDate < today;
                                    const isAlreadyBooked = myBookedDates.has(dateStr);

                                    const cellBg = isToday ? "bg-violet-50/30 dark:bg-violet-900/5" : "";

                                    return (
                                        <td key={dayIdx} className={`border-r border-b last:border-r-0 border-slate-200 dark:border-slate-700 p-3 h-[180px] align-top ${cellBg}`}>
                                            {isAlreadyBooked ? (
                                                <div className="w-full rounded-xl border border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 h-full flex flex-col items-center justify-center gap-2 transition-all duration-200">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center">
                                                        <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">
                                                        Booked
                                                    </span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => !isPast && handleDayClick(dayDate)}
                                                    disabled={isPast}
                                                    className={`w-full rounded-xl border border-dashed h-full flex flex-col items-center justify-center gap-2 transition-all duration-200 ${isPast
                                                        ? "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 cursor-not-allowed opacity-60"
                                                        : "border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/60 dark:hover:bg-violet-900/10 cursor-pointer group active:scale-[0.98]"
                                                        }`}
                                                >
                                                    {!isPast && (
                                                        <>
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 flex items-center justify-center transition-colors">
                                                                <Package size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mt-1">
                                                                Book Cupboard
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">For Full Day</span>
                                                        </>
                                                    )}
                                                    {isPast && (
                                                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                            Past Date
                                                        </span>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cupboard Selection Popup */}
            <AnimatePresence>
                {showPopup && selectedDate && (
                    <CupboardSelectionPopup
                        dayDate={selectedDate}
                        onClose={() => { setShowPopup(false); setSelectedDate(null); }}
                        onBooked={() => {
                            setShowPopup(false);
                            setSelectedDate(null);
                            fetchMyBookings();
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ══════════════════════════════════════════
   ADMIN CUPBOARDS CRUD VIEW
   ══════════════════════════════════════════ */
interface AdminCupboard {
    cupboard_id: number;
    cupboard_name: string;
    resource_id: number;
    total_shelves: number | null;
    resources: {
        resource_name: string;
        buildings: { building_name: string };
    };
}

function AdminCupboardsView() {
    const [cupboards, setCupboards] = useState<AdminCupboard[]>([]);
    const [resources, setResources] = useState<{ resource_id: number; resource_name: string; buildings: { building_name: string } }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editCupboard, setEditCupboard] = useState<AdminCupboard | null>(null);
    const [formData, setFormData] = useState({ cupboard_name: "", resource_id: "", total_shelves: "" });
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");

    const fetchCupboards = useCallback(async () => {
        try {
            const res = await fetch("/api/cupboards");
            if (res.ok) setCupboards(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchCupboards();
        fetch("/api/resources").then(r => r.json()).then(setResources).catch(console.error);
    }, [fetchCupboards]);

    const openForm = (cupboard?: AdminCupboard) => {
        if (cupboard) {
            setEditCupboard(cupboard);
            setFormData({
                cupboard_name: cupboard.cupboard_name,
                resource_id: cupboard.resource_id.toString(),
                total_shelves: cupboard.total_shelves?.toString() || "",
            });
        } else {
            setEditCupboard(null);
            setFormData({ cupboard_name: "", resource_id: "", total_shelves: "" });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editCupboard ? `/api/cupboards/${editCupboard.cupboard_id}` : "/api/cupboards";
            const method = editCupboard ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cupboard_name: formData.cupboard_name,
                    resource_id: parseInt(formData.resource_id),
                    total_shelves: formData.total_shelves ? parseInt(formData.total_shelves) : null,
                }),
            });
            if (res.ok) {
                toast.success(editCupboard ? "Cupboard updated" : "Cupboard added");
                setShowForm(false);
                fetchCupboards();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this cupboard?")) return;
        try {
            const res = await fetch(`/api/cupboards/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Cupboard deleted"); fetchCupboards(); }
        } catch { toast.error("Delete failed"); }
    };

    const filtered = cupboards.filter(c =>
        c.cupboard_name.toLowerCase().includes(search.toLowerCase()) ||
        c.resources?.resource_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.resources?.buildings?.building_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-96 animate-pulse" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Cupboards</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {cupboards.length} cupboard{cupboards.length !== 1 ? "s" : ""} in the system
                    </p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => openForm()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-violet-600/20 transition-colors">
                    <Plus size={16} /> Add Cupboard
                </motion.button>
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, resource, or building..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {filtered.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cupboard</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resource</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Building</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Shelves</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map((c, i) => (
                                    <motion.tr key={c.cupboard_id}
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03, duration: 0.25 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                                    <Package size={16} />
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{c.cupboard_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{c.resources?.resource_name}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                <Building2 size={13} className="text-slate-400" /> {c.resources?.buildings?.building_name}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/10">
                                                {c.total_shelves ?? 0} shelves
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openForm(c)}
                                                    className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all active:scale-90">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(c.cupboard_id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all active:scale-90">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {search ? "No cupboards match your search." : "No cupboards yet."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    {editCupboard ? "Edit Cupboard" : "Add Cupboard"}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Cupboard Name *</label>
                                    <input type="text" value={formData.cupboard_name} onChange={(e) => setFormData({ ...formData, cupboard_name: e.target.value })}
                                        required placeholder="e.g. Cupboard A1"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Resource *</label>
                                    <select value={formData.resource_id} onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })} required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all">
                                        <option value="">Select resource</option>
                                        {resources.map(r => <option key={r.resource_id} value={r.resource_id}>{r.resource_name} — {r.buildings?.building_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Total Shelves</label>
                                    <input type="number" value={formData.total_shelves} onChange={(e) => setFormData({ ...formData, total_shelves: e.target.value })}
                                        placeholder="e.g. 5" min="0"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors active:scale-[0.98]">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm shadow-violet-600/20 transition-colors disabled:opacity-50 active:scale-[0.98]">
                                        {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                                            : editCupboard ? "Save Changes" : "Add Cupboard"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ══════════════════════════════════════════
   CUPBOARD SELECTION POPUP (3-step wizard)
   ══════════════════════════════════════════ */
interface CupboardSelectionPopupProps {
    dayDate: Date;
    onClose: () => void;
    onBooked: () => void;
}

function CupboardSelectionPopup({ dayDate, onClose, onBooked }: CupboardSelectionPopupProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Step 1: Filters
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loadingBuildings, setLoadingBuildings] = useState(true);

    // Step 2: Cupboards
    const [cupboards, setCupboards] = useState<Cupboard[]>([]);
    const [loadingCupboards, setLoadingCupboards] = useState(false);

    // Step 3: Confirmation
    const [selectedCupboard, setSelectedCupboard] = useState<Cupboard | null>(null);
    const [submittingBooking, setSubmittingBooking] = useState(false);

    useEffect(() => {
        fetch("/api/buildings")
            .then(r => r.json())
            .then(setBuildings)
            .catch(console.error)
            .finally(() => setLoadingBuildings(false));
    }, []);

    const handleSelectBuilding = async (buildingId: number) => {
        setLoadingCupboards(true);
        try {
            const dateStr = dayDate.toISOString().split('T')[0];
            const queryParams = new URLSearchParams({
                date: dateStr,
                minShelves: "1", // Hardcoded safely as there's no more filter here
                buildingId: buildingId.toString()
            });

            const res = await fetch(`/api/cupboards?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setCupboards(data);
                setStep(2);
            } else {
                toast.error("Failed to fetch cupboards");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoadingCupboards(false);
        }
    };

    const handleSelectCupboard = (cupboard: Cupboard) => {
        if (cupboard.is_booked) return;
        setSelectedCupboard(cupboard);
        setStep(3);
    };

    const handleSubmitBooking = async () => {
        if (!selectedCupboard) return;

        setSubmittingBooking(true);
        try {
            const dateStr = dayDate.toISOString().split('T')[0];
            const res = await fetch("/api/cupboards/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cupboard_id: selectedCupboard.cupboard_id,
                    date: dateStr
                }),
            });

            if (res.ok) {
                toast.success("Cupboard booked successfully!");
                onBooked();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to book cupboard");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSubmittingBooking(false);
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
                className="relative z-10 w-full max-w-2xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800 dark:text-white">Book a Cupboard</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                For {formattedDate} (Full Day)
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-4">
                        {[
                            { num: 1, label: "Filters" },
                            { num: 2, label: "Select Cupboard" },
                            { num: 3, label: "Confirm" }
                        ].map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <button
                                    onClick={() => {
                                        if (s.num < step) setStep(s.num as any);
                                    }}
                                    disabled={s.num > step}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${step === s.num
                                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400"
                                        : step > s.num
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 cursor-pointer"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                        }`}
                                >
                                    {step > s.num ? <Check size={12} /> : <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">{s.num}</span>}
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
                <div className="px-5 py-6 overflow-y-auto flex-1 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Filter Buildings & Shelves */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.2 }} className="space-y-6">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 block">1. Select Building</label>
                                {loadingBuildings ? (
                                    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-violet-600" /></div>
                                ) : buildings.length > 0 ? (
                                    buildings.map((b, i) => (
                                        <motion.button
                                            key={b.building_id}
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            onClick={() => handleSelectBuilding(b.building_id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-200 text-left active:scale-[0.98]"
                                        >
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

                        {/* Step 2: Select Cupboard from List */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.2 }}>
                                {cupboards.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {cupboards.map((cupboard, i) => (
                                            <motion.button
                                                key={cupboard.cupboard_id}
                                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                                onClick={() => handleSelectCupboard(cupboard)}
                                                disabled={cupboard.is_booked}
                                                className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${cupboard.is_booked
                                                    ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 opacity-60 cursor-not-allowed grayscale-[30%]"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md"
                                                    }`}
                                            >
                                                {/* Booked Overlay */}
                                                {cupboard.is_booked && (
                                                    <div className="absolute inset-x-0 bottom-0 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider text-center py-1.5 border-t border-rose-100 dark:border-rose-900/50">
                                                        Booked by {cupboard.users?.name || "User"}
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-3 w-full">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cupboard.is_booked ? "bg-slate-200 dark:bg-slate-800 text-slate-400" : "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"}`}>
                                                        <Package size={20} />
                                                    </div>
                                                    {!cupboard.is_booked && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/10">
                                                            Available
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="font-bold text-slate-800 dark:text-white mb-1 truncate w-full">{cupboard.cupboard_name}</h4>
                                                <div className="space-y-1.5 w-full mt-2">
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                                                        <span>Room:</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{cupboard.resources.resource_name}</span>
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                                                        <span>Shelves:</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{cupboard.total_shelves}</span>
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Info className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                        <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Cupboards Found</h4>
                                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Try adjusting your filters (e.g., lower the minimum shelves or change the building).</p>
                                        <button
                                            onClick={() => setStep(1)}
                                            className="mt-6 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors"
                                        >
                                            Go Back
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && selectedCupboard && (
                            <motion.div key="step3" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.2 }} className="text-center py-6 px-4">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package size={36} className="text-emerald-600 dark:text-emerald-400" />
                                    <div className="absolute ml-12 mt-12 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Ready to Book?</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto mb-8 leading-relaxed">
                                    You are booking <span className="font-bold text-slate-700 dark:text-slate-200">{selectedCupboard.cupboard_name}</span> in {selectedCupboard.resources.buildings.building_name} for the full day on <span className="font-bold text-slate-700 dark:text-slate-200">{formattedDate}</span>.
                                </p>

                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={submittingBooking}
                                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmitBooking}
                                        disabled={submittingBooking}
                                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                    >
                                        {submittingBooking ? (
                                            <><Loader2 size={18} className="animate-spin" /> Booking...</>
                                        ) : (
                                            <>Confirm Booking</>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
