"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Edit2, Trash2, X, Loader2, Layers, Shield } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

interface Building {
    building_id: number;
    building_name: string;
    building_number: string | null;
    total_floors: number | null;
    _count: { resources: number };
}

export default function BuildingsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Building | null>(null);
    const [saving, setSaving] = useState(false);
    const { isAdmin } = useUser();

    const [form, setForm] = useState({
        building_name: "", building_number: "", total_floors: "",
    });

    const fetchBuildings = useCallback(async () => {
        try {
            const res = await fetch("/api/buildings");
            if (res.ok) setBuildings(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBuildings(); }, [fetchBuildings]);

    const openAdd = () => {
        setEditing(null);
        setForm({ building_name: "", building_number: "", total_floors: "" });
        setShowModal(true);
    };

    const openEdit = (b: Building) => {
        setEditing(b);
        setForm({
            building_name: b.building_name,
            building_number: b.building_number || "",
            total_floors: b.total_floors ? String(b.total_floors) : "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;
        setSaving(true);
        const body = {
            building_name: form.building_name,
            building_number: form.building_number || null,
            total_floors: form.total_floors ? Number(form.total_floors) : null,
        };
        try {
            const url = editing ? `/api/buildings/${editing.building_id}` : "/api/buildings";
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (res.ok) {
                toast.success(editing ? "Building updated" : "Building created");
                setShowModal(false);
                fetchBuildings();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) return;
        if (!confirm("Delete this building? Resources in this building may be affected.")) return;
        try {
            const res = await fetch(`/api/buildings/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Building deleted"); fetchBuildings(); }
        } catch { toast.error("Delete failed"); }
    };

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
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Buildings</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <Shield size={12} className="text-rose-600 dark:text-rose-400" />
                            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Admin Only</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage building locations for your resources.</p>
                </div>
                {isAdmin && (
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm">
                        <Plus size={18} /> Add Building
                    </button>
                )}
            </div>

            {/* Cards */}
            {buildings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buildings.map((b, i) => (
                        <motion.div
                            key={b.building_id}
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow p-5"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{b.building_name}</h3>
                                        {b.building_number && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">#{b.building_number}</p>
                                        )}
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(b)} className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors" title="Edit">
                                            <Edit2 size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(b.building_id)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                {b.total_floors !== null && (
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                        <Layers size={14} className="text-slate-400" />
                                        <span>{b.total_floors} floors</span>
                                    </div>
                                )}
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                                    {b._count.resources} resources
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm py-16 text-center">
                    <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No buildings yet. Add your first building!</p>
                </div>
            )}

            {/* Modal - Admin only */}
            {showModal && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{editing ? "Edit Building" : "Add Building"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Building Name *</label>
                                <input required value={form.building_name} onChange={(e) => setForm({ ...form, building_name: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                    placeholder="e.g. Main Academic Block" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Building Number</label>
                                    <input value={form.building_number} onChange={(e) => setForm({ ...form, building_number: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        placeholder="e.g. A1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Total Floors</label>
                                    <input type="number" min="1" value={form.total_floors} onChange={(e) => setForm({ ...form, total_floors: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        placeholder="e.g. 5" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    {editing ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
