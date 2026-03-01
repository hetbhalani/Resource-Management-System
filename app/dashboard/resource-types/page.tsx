"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tags, Plus, Pencil, Trash2, X, Loader2, Box } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

interface ResourceType {
    type_id: number;
    type_name: string;
    _count?: { resources: number };
}

const TYPE_COLORS = [
    { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 ring-violet-500/10" },
    { bg: "from-sky-500 to-cyan-600", light: "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 ring-sky-500/10" },
    { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-emerald-500/10" },
    { bg: "from-amber-500 to-orange-500", light: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-amber-500/10" },
    { bg: "from-rose-500 to-pink-600", light: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 ring-rose-500/10" },
    { bg: "from-indigo-500 to-blue-600", light: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-indigo-500/10" },
];

export default function ResourceTypesPage() {
    const [types, setTypes] = useState<ResourceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editType, setEditType] = useState<ResourceType | null>(null);
    const [typeName, setTypeName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { isAdmin } = useUser();

    const fetchTypes = useCallback(async () => {
        try {
            const res = await fetch("/api/resource-types");
            if (res.ok) setTypes(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTypes(); }, [fetchTypes]);

    const openForm = (type?: ResourceType) => {
        if (type) {
            setEditType(type);
            setTypeName(type.type_name);
        } else {
            setEditType(null);
            setTypeName("");
        }
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editType ? `/api/resource-types/${editType.type_id}` : "/api/resource-types";
            const method = editType ? "PUT" : "POST";
            const res = await fetch(url, {
                method, headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type_name: typeName }),
            });
            if (res.ok) {
                toast.success(editType ? "Type updated" : "Type added");
                setShowForm(false);
                fetchTypes();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this resource type?")) return;
        try {
            const res = await fetch(`/api/resource-types/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Type deleted"); fetchTypes(); }
        } catch { toast.error("Delete failed"); }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-36 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Resource Types</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {types.length} type{types.length !== 1 ? "s" : ""} defined
                    </p>
                </div>
                {isAdmin && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => openForm()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-violet-600/20 transition-colors">
                        <Plus size={16} /> Add Type
                    </motion.button>
                )}
            </div>

            {types.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {types.map((type, i) => {
                        const color = TYPE_COLORS[i % TYPE_COLORS.length];
                        return (
                            <motion.div key={type.type_id} variants={cardVariants}
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 card-interactive group overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color.bg} shadow-sm`}>
                                            <Tags size={18} className="text-white" />
                                        </div>
                                        {isAdmin && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button onClick={() => openForm(type)}
                                                    className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all active:scale-90">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(type.type_id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all active:scale-90">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">{type.type_name}</h3>
                                </div>
                                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                                    <div className="flex items-center gap-1.5">
                                        <Box size={12} className="text-slate-400" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {type._count?.resources ?? 0} resource{(type._count?.resources ?? 0) !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : (
                <div className="py-20 text-center">
                    <Tags className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No resource types defined yet</p>
                    {isAdmin && (
                        <button onClick={() => openForm()} className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline">
                            + Add your first type
                        </button>
                    )}
                </div>
            )}

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
                            className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    {editType ? "Edit Type" : "Add Type"}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Type Name *</label>
                                    <input type="text" value={typeName} onChange={(e) => setTypeName(e.target.value)} required
                                        placeholder="e.g. Classroom, Lab, Projector"
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
                                            : editType ? "Save Changes" : "Add Type"}
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
