"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wrench, Plus, Pencil, Trash2, X, Search, Loader2, Clock,
    AlertTriangle, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

interface Resource {
    resource_id: number;
    resource_name: string;
}

interface Maintenance {
    maintenance_id: number;
    resource_id: number;
    reported_by: number | null;
    maintenance_type: string;
    scheduled_date: string;
    status: string;
    notes: string | null;
    resources: { resource_name: string };
    users: { name: string } | null;
}

export default function MaintenancePage() {
    const [records, setRecords] = useState<Maintenance[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editRecord, setEditRecord] = useState<Maintenance | null>(null);
    const [formData, setFormData] = useState({
        resource_id: "", maintenance_type: "preventive", scheduled_date: "", status: "scheduled", notes: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const { user, isAdmin } = useUser();

    const fetchRecords = useCallback(async () => {
        try {
            const res = await fetch("/api/maintenance");
            if (res.ok) setRecords(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchRecords();
        fetch("/api/resources").then(r => r.json()).then(setResources).catch(console.error);
    }, [fetchRecords]);

    const openForm = (record?: Maintenance) => {
        if (record) {
            setEditRecord(record);
            setFormData({
                resource_id: record.resource_id.toString(),
                maintenance_type: record.maintenance_type,
                scheduled_date: record.scheduled_date ? new Date(record.scheduled_date).toISOString().split("T")[0] : "",
                status: record.status,
                notes: record.notes || "",
            });
        } else {
            setEditRecord(null);
            setFormData({ resource_id: "", maintenance_type: "preventive", scheduled_date: "", status: "scheduled", notes: "" });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editRecord ? `/api/maintenance/${editRecord.maintenance_id}` : "/api/maintenance";
            const method = editRecord ? "PUT" : "POST";
            const body: Record<string, unknown> = {
                resource_id: parseInt(formData.resource_id),
                maintenance_type: formData.maintenance_type,
                scheduled_date: formData.scheduled_date,
                status: formData.status,
                notes: formData.notes || null,
            };
            if (!editRecord) body.reported_by = Number(user?.userId);

            const res = await fetch(url, {
                method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
            });
            if (res.ok) {
                toast.success(editRecord ? "Record updated" : isAdmin ? "Maintenance scheduled" : "Issue reported");
                setShowForm(false);
                fetchRecords();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this maintenance record?")) return;
        try {
            const res = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Record deleted"); fetchRecords(); }
        } catch { toast.error("Delete failed"); }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "completed": return { icon: CheckCircle2, style: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/10", dot: "status-dot-active" };
            case "in_progress": return { icon: Clock, style: "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 ring-1 ring-sky-500/10", dot: "status-dot-active" };
            case "scheduled": return { icon: AlertTriangle, style: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/10", dot: "status-dot-pending" };
            case "cancelled": return { icon: XCircle, style: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400", dot: "" };
            default: return { icon: Clock, style: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400", dot: "" };
        }
    };

    const formatDate = (dt: string) =>
        new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const filtered = records.filter(r => {
        const matchSearch = r.resources.resource_name.toLowerCase().includes(search.toLowerCase()) ||
            r.maintenance_type.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-96 animate-pulse" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Maintenance</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {isAdmin ? "Schedule and track maintenance activities" : "Report issues with resources"}
                    </p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => openForm()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-violet-600/20 transition-colors">
                    <Plus size={16} /> {isAdmin ? "Schedule Maintenance" : "Report Issue"}
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by resource or type..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all">
                    <option value="">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
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
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scheduled</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reported By</th>
                                    {isAdmin && <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map((r, i) => {
                                    const statusConfig = getStatusConfig(r.status);
                                    return (
                                        <motion.tr
                                            key={r.maintenance_id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.25 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                                        <Wrench size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{r.resources.resource_name}</span>
                                                        {r.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px]">{r.notes}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/10 capitalize">
                                                    {r.maintenance_type.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                                                {r.scheduled_date ? formatDate(r.scheduled_date) : "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusConfig.style}`}>
                                                    {statusConfig.dot && <span className={`status-dot ${statusConfig.dot}`} />}
                                                    {r.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                                                {r.users?.name || "—"}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openForm(r)}
                                                            className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all active:scale-90">
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button onClick={() => handleDelete(r.maintenance_id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all active:scale-90">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {search || filterStatus ? "No records match your filter." : "No maintenance records yet."}
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
                                    {editRecord ? "Edit Record" : isAdmin ? "Schedule Maintenance" : "Report Issue"}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Resource *</label>
                                    <select value={formData.resource_id} onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })} required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all">
                                        <option value="">Select a resource</option>
                                        {resources.map(r => <option key={r.resource_id} value={r.resource_id}>{r.resource_name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Type</label>
                                        <select value={formData.maintenance_type} onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all">
                                            <option value="preventive">Preventive</option>
                                            <option value="corrective">Corrective</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Date</label>
                                        <input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all">
                                            <option value="scheduled">Scheduled</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Notes</label>
                                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Describe the issue or maintenance details..." rows={3}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors active:scale-[0.98]">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm shadow-violet-600/20 transition-colors disabled:opacity-50 active:scale-[0.98]">
                                        {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                                            : editRecord ? "Save Changes" : isAdmin ? "Schedule" : "Report Issue"}
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
