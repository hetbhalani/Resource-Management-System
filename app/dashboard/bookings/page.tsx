"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Search, Check, X, Ban, Loader2, Box, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

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

interface Resource { resource_id: number; resource_name: string; }

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const { user, isAdmin } = useUser();

    const [form, setForm] = useState({
        resource_id: "", start_date: "", start_time: "", end_date: "", end_time: "",
    });

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch("/api/bookings");
            if (res.ok) setBookings(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchBookings();
        fetch("/api/resources").then(r => r.json()).then(setResources).catch(console.error);
    }, [fetchBookings]);

    // Filter bookings: admin sees all, students/faculty see only their own
    const visibleBookings = isAdmin
        ? bookings
        : bookings.filter(b => String(b.user_id) === user?.userId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isAdmin) { toast.error("Admins cannot create bookings"); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resource_id: Number(form.resource_id),
                    start_datetime: `${form.start_date}T${form.start_time}:00`,
                    end_datetime: `${form.end_date}T${form.end_time}:00`,
                }),
            });
            if (res.ok) {
                toast.success("Booking created successfully! Awaiting admin approval.");
                setShowModal(false);
                setForm({ resource_id: "", start_date: "", start_time: "", end_date: "", end_time: "" });
                fetchBookings();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create booking");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSaving(false); }
    };

    const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
        try {
            const body: Record<string, unknown> = { status: newStatus };
            if (isAdmin && (newStatus === "approved" || newStatus === "rejected")) {
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
            case "approved": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
            case "pending": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
            case "rejected": return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400";
            case "cancelled": return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
            default: return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
        }
    };

    const formatDateTime = (dt: string) => {
        return new Date(dt).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "numeric", minute: "2-digit", hour12: true,
        });
    };

    const filtered = visibleBookings.filter(b => {
        const matchSearch = b.resources.resource_name.toLowerCase().includes(search.toLowerCase()) ||
            b.users_bookings_user_idTousers.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || b.status === filterStatus;
        return matchSearch && matchStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Bookings</h1>
                        {isAdmin && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                                <Shield size={12} className="text-rose-600 dark:text-rose-400" />
                                <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Approval View</span>
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {isAdmin ? "Review and approve booking requests from students and faculty." : "Book resources and track your reservation status."}
                    </p>
                </div>
                {!isAdmin && (
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm">
                        <Plus size={18} /> New Booking
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by resource or user..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
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
                                {filtered.map((b) => {
                                    const isOwner = String(b.user_id) === user?.userId;
                                    const canCancel = isOwner && (b.status === "pending" || b.status === "approved");
                                    const canApprove = isAdmin && b.status === "pending";
                                    return (
                                        <tr key={b.booking_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
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
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(b.status)}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {canApprove && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(b.booking_id, "approved")}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Approve">
                                                                <Check size={14} /> Approve
                                                            </button>
                                                            <button onClick={() => handleStatusUpdate(b.booking_id, "rejected")}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Reject">
                                                                <X size={14} /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {canCancel && (
                                                        <button onClick={() => handleStatusUpdate(b.booking_id, "cancelled")}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors" title="Cancel">
                                                            <Ban size={14} /> Cancel
                                                        </button>
                                                    )}
                                                    {!canApprove && !canCancel && (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {search || filterStatus ? "No bookings match your search." : isAdmin ? "No booking requests yet." : "You haven't made any bookings yet."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Booking Modal - Students/Faculty only */}
            {showModal && !isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">New Booking</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                    ⏳ Your booking will be submitted for admin approval and marked as &quot;pending&quot; until reviewed.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Resource *</label>
                                <select required value={form.resource_id} onChange={(e) => setForm({ ...form, resource_id: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                    <option value="">Select resource</option>
                                    {resources.map(r => <option key={r.resource_id} value={r.resource_id}>{r.resource_name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date *</label>
                                    <input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Time *</label>
                                    <input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Date *</label>
                                    <input type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End Time *</label>
                                    <input type="time" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    Submit Booking
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
