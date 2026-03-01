"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, Plus, Pencil, Trash2, X, Layers, Hash, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

interface Building {
    building_id: number;
    building_name: string;
    building_number: string | null;
    total_floors: number | null;
    _count?: { resources: number };
}

export default function BuildingsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editBuilding, setEditBuilding] = useState<Building | null>(null);
    const [formData, setFormData] = useState({ building_name: "", building_number: "", total_floors: "" });
    const [submitting, setSubmitting] = useState(false);
    const { isAdmin } = useUser();

    const fetchBuildings = useCallback(async () => {
        try {
            const res = await fetch("/api/buildings");
            if (res.ok) setBuildings(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBuildings(); }, [fetchBuildings]);

    const openForm = (building?: Building) => {
        if (building) {
            setEditBuilding(building);
            setFormData({
                building_name: building.building_name,
                building_number: building.building_number || "",
                total_floors: building.total_floors?.toString() || "",
            });
        } else {
            setEditBuilding(null);
            setFormData({ building_name: "", building_number: "", total_floors: "" });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editBuilding ? `/api/buildings/${editBuilding.building_id}` : "/api/buildings";
            const method = editBuilding ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    building_name: formData.building_name,
                    building_number: formData.building_number || null,
                    total_floors: formData.total_floors ? parseInt(formData.total_floors) : null,
                }),
            });
            if (res.ok) {
                toast.success(editBuilding ? "Building updated" : "Building added");
                setShowForm(false);
                fetchBuildings();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save building");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this building?")) return;
        try {
            const res = await fetch(`/api/buildings/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Building deleted");
                fetchBuildings();
            }
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
                <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-44 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Buildings</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {buildings.length} building{buildings.length !== 1 ? "s" : ""} in the system
                    </p>
                </div>
                {isAdmin && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openForm()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-violet-600/20 transition-colors"
                    >
                        <Plus size={16} /> Add Building
                    </motion.button>
                )}
            </div>

            {/* Grid */}
            {buildings.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {buildings.map((building) => (
                        <motion.div
                            key={building.building_id}
                            variants={cardVariants}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 card-interactive group"
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
                                        <Building2 size={20} />
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button onClick={() => openForm(building)}
                                                className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all active:scale-90"
                                                title="Edit">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(building.building_id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all active:scale-90"
                                                title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-2">{building.building_name}</h3>
                                <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    {building.building_number && (
                                        <div className="flex items-center gap-1.5">
                                            <Hash size={12} /> #{building.building_number}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Layers size={12} /> {building.total_floors ?? 0} floors
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-2xl">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {building._count?.resources ?? 0} resource{(building._count?.resources ?? 0) !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="py-20 text-center">
                    <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No buildings have been added yet</p>
                    {isAdmin && (
                        <button onClick={() => openForm()} className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline">
                            + Add your first building
                        </button>
                    )}
                </div>
            )}

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowForm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    {editBuilding ? "Edit Building" : "Add Building"}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Building Name *</label>
                                    <input type="text" value={formData.building_name}
                                        onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                                        required placeholder="e.g. Engineering Block"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Building Number</label>
                                    <input type="text" value={formData.building_number}
                                        onChange={(e) => setFormData({ ...formData, building_number: e.target.value })}
                                        placeholder="e.g. B-101"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Total Floors</label>
                                    <input type="number" value={formData.total_floors}
                                        onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                                        placeholder="e.g. 5" min="1"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors active:scale-[0.98]">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm shadow-violet-600/20 transition-colors disabled:opacity-50 active:scale-[0.98]">
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                                        ) : editBuilding ? "Save Changes" : "Add Building"}
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
