"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Wrench, Plus, Search, Edit2, Trash2, X, Loader2, Box, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

interface Maintenance {
    maintenance_id: number;
    resource_id: number;
    maintenance_type: string;
    scheduled_date: string;
    status: string;
    notes: string | null;
    resources: { resource_id: number; resource_name: string };
}

interface Resource { resource_id: number; resource_name: string; }

export default function MaintenancePage() {
    const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Maintenance | null>(null);
    const [saving, setSaving] = useState(false);
    const { isAdmin } = useUser();

    const [form, setForm] = useState({
        resource_id: "", maintenance_type: "", scheduled_date: "", status: "scheduled", notes: "",
    });

    const fetchMaintenance = useCallback(async () => {
        try {
            const res = await fetch("/api/maintenance");
            if (res.ok) setMaintenance(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchMaintenance();
        fetch("/api/resources").then(r => r.json()).then(setResources).catch(console.error);
    }, [fetchMaintenance]);

    const openAdd = () => {
        setEditing(null);
        setForm({ resource_id: "", maintenance_type: "", scheduled_date: "", status: "scheduled", notes: "" });
        setShowModal(true);
    };

    const openEdit = (m: Maintenance) => {
        setEditing(m);
        setForm({
            resource_id: String(m.resource_id),
            maintenance_type: m.maintenance_type,
            scheduled_date: m.scheduled_date.split("T")[0],
            status: m.status,
            notes: m.notes || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const body = {
            resource_id: Number(form.resource_id),
            maintenance_type: form.maintenance_type,
            scheduled_date: form.scheduled_date,
            status: editing ? form.status : "scheduled",
            notes: form.notes || null,
        };
        try {
            const url = editing ? `/api/maintenance/${editing.maintenance_id}` : "/api/maintenance";
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (res.ok) {
                toast.success(editing ? "Maintenance record updated" : "Maintenance request submitted");
                setShowModal(false);
                fetchMaintenance();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) return;
        if (!confirm("Delete this maintenance record?")) return;
        try {
            const res = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Maintenance record deleted"); fetchMaintenance(); }
        } catch { toast.error("Delete failed"); }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "scheduled": return "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400";
            case "in-progress": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
            case "completed": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
            default: return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
        }
    };

    const filtered = maintenance.filter(m => {
        const matchSearch = m.resources.resource_name.toLowerCase().includes(search.toLowerCase()) ||
            m.maintenance_type.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || m.status === filterStatus;
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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Maintenance</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {isAdmin ? "Manage and track all maintenance activities." : "Report and track resource maintenance requests."}
                    </p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm">
                    <Plus size={18} /> {isAdmin ? "Schedule Maintenance" : "Report Issue"}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by resource or type..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                    <option value="">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
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
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scheduled Date</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map((m) => (
                                    <tr key={m.maintenance_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                                    <Box size={16} className="text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{m.resources.resource_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                <Wrench size={14} className="text-slate-400" /> {m.maintenance_type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                                <CalendarDays size={14} className="text-slate-400" />
                                                {new Date(m.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(m.status)}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{m.notes || "—"}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => openEdit(m)} className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors" title="Edit">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(m.maintenance_id)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {!isAdmin && <span className="text-xs text-slate-400 dark:text-slate-500">—</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {search || filterStatus ? "No maintenance records match your search." : "No maintenance records yet."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                {editing ? "Edit Maintenance" : isAdmin ? "Schedule Maintenance" : "Report Maintenance Issue"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            {!isAdmin && !editing && (
                                <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
                                    <p className="text-xs text-sky-700 dark:text-sky-400 font-medium">
                                        🔧 Report a resource issue. An admin will review and schedule the maintenance.
                                    </p>
                                </div>
                            )}
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
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        {isAdmin ? "Maintenance Type *" : "Issue Type *"}
                                    </label>
                                    <input required value={form.maintenance_type} onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        placeholder="e.g. Cleaning, Repair" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        {isAdmin ? "Scheduled Date *" : "Preferred Date *"}
                                    </label>
                                    <input type="date" required value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                </div>
                            </div>
                            {/* Only admin can change status */}
                            {isAdmin && editing && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    {isAdmin ? "Notes" : "Description of Issue"}
                                </label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                                    placeholder={isAdmin ? "Optional notes..." : "Describe the issue..."} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    {editing ? "Update" : isAdmin ? "Schedule" : "Submit Report"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
