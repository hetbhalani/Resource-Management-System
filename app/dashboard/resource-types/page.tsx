"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Tags, Plus, Edit2, Trash2, X, Loader2, Box, Shield } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

interface ResourceType {
    resource_type_id: number;
    type_name: string;
    _count: { resources: number };
}

export default function ResourceTypesPage() {
    const [types, setTypes] = useState<ResourceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ResourceType | null>(null);
    const [saving, setSaving] = useState(false);
    const [typeName, setTypeName] = useState("");
    const { isAdmin } = useUser();

    const fetchTypes = useCallback(async () => {
        try {
            const res = await fetch("/api/resource_types");
            if (res.ok) setTypes(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTypes(); }, [fetchTypes]);

    const openAdd = () => {
        setEditing(null);
        setTypeName("");
        setShowModal(true);
    };

    const openEdit = (t: ResourceType) => {
        setEditing(t);
        setTypeName(t.type_name);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;
        setSaving(true);
        try {
            const url = editing ? `/api/resource_types/${editing.resource_type_id}` : "/api/resource_types";
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type_name: typeName }),
            });
            if (res.ok) {
                toast.success(editing ? "Resource type updated" : "Resource type created");
                setShowModal(false);
                fetchTypes();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) return;
        if (!confirm("Delete this resource type? This may affect associated resources.")) return;
        try {
            const res = await fetch(`/api/resource_types/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Resource type deleted"); fetchTypes(); }
            else { toast.error("Cannot delete — resources may still reference this type."); }
        } catch { toast.error("Delete failed"); }
    };

    const colors = [
        { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400" },
        { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-600 dark:text-sky-400" },
        { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
        { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400" },
        { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
        { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400" },
    ];

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
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Resource Types</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <Shield size={12} className="text-rose-600 dark:text-rose-400" />
                            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Admin Only</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Categorize your resources by type.</p>
                </div>
                {isAdmin && (
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm">
                        <Plus size={18} /> Add Type
                    </button>
                )}
            </div>

            {/* Cards */}
            {types.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {types.map((t, i) => {
                        const color = colors[i % colors.length];
                        return (
                            <motion.div
                                key={t.resource_type_id}
                                initial={{ y: 16, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}>
                                            <Tags size={20} className={color.text} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{t.type_name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <Box size={12} className="text-slate-400" />
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{t._count.resources} resources</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEdit(t)} className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors" title="Edit">
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(t.resource_type_id)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm py-16 text-center">
                    <Tags className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No resource types yet. Add your first type!</p>
                </div>
            )}

            {/* Modal - Admin only */}
            {showModal && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{editing ? "Edit Resource Type" : "Add Resource Type"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type Name *</label>
                                <input required value={typeName} onChange={(e) => setTypeName(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                    placeholder="e.g. Classroom, Lab, Auditorium" />
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
