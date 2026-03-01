"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Box, Plus, Pencil, Trash2, X, Search, Filter, Loader2,
    Building2, Layers, Monitor, FlaskConical, Speaker, Laptop, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

interface ResourceType {
    type_id: number;
    type_name: string;
}

interface Resource {
    resource_id: number;
    resource_name: string;
    type_id: number;
    building_id: number;
    floor_number: number | null;
    description: string | null;
    resource_types: { type_name: string };
    buildings: { building_name: string };
}

interface Building {
    building_id: number;
    building_name: string;
    total_floors: number | null;
}

function getResourceIcon(typeName: string) {
    const name = typeName.toLowerCase();
    if (name.includes("lab")) return FlaskConical;
    if (name.includes("computer") || name.includes("pc")) return Monitor;
    if (name.includes("projector") || name.includes("audio")) return Speaker;
    if (name.includes("laptop")) return Laptop;
    if (name.includes("library") || name.includes("book")) return BookOpen;
    return Box;
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [types, setTypes] = useState<ResourceType[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editResource, setEditResource] = useState<Resource | null>(null);
    const [formData, setFormData] = useState({
        resource_name: "", type_id: "", building_id: "", floor_number: "", description: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const { isAdmin } = useUser();

    const fetchResources = useCallback(async () => {
        try {
            const res = await fetch("/api/resources");
            if (res.ok) setResources(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchResources();
        fetch("/api/resource-types").then(r => r.json()).then(setTypes).catch(console.error);
        fetch("/api/buildings").then(r => r.json()).then(setBuildings).catch(console.error);
    }, [fetchResources]);

    const openForm = (resource?: Resource) => {
        if (resource) {
            setEditResource(resource);
            setFormData({
                resource_name: resource.resource_name,
                type_id: resource.type_id.toString(),
                building_id: resource.building_id.toString(),
                floor_number: resource.floor_number?.toString() || "",
                description: resource.description || "",
            });
        } else {
            setEditResource(null);
            setFormData({ resource_name: "", type_id: "", building_id: "", floor_number: "", description: "" });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editResource ? `/api/resources/${editResource.resource_id}` : "/api/resources";
            const method = editResource ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resource_name: formData.resource_name,
                    type_id: parseInt(formData.type_id),
                    building_id: parseInt(formData.building_id),
                    floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
                    description: formData.description || null,
                }),
            });
            if (res.ok) {
                toast.success(editResource ? "Resource updated" : "Resource added");
                setShowForm(false);
                fetchResources();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this resource?")) return;
        try {
            const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Resource deleted"); fetchResources(); }
        } catch { toast.error("Delete failed"); }
    };

    const filtered = resources.filter(r => {
        const matchSearch = r.resource_name.toLowerCase().includes(search.toLowerCase()) ||
            r.buildings.building_name.toLowerCase().includes(search.toLowerCase());
        const matchType = !filterType || r.type_id.toString() === filterType;
        return matchSearch && matchType;
    });

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Resources</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {resources.length} resource{resources.length !== 1 ? "s" : ""} across all buildings
                    </p>
                </div>
                {isAdmin && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => openForm()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-violet-600/20 transition-colors">
                        <Plus size={16} /> Add Resource
                    </motion.button>
                )}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or building..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                </div>
                <div className="relative">
                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all appearance-none">
                        <option value="">All Types</option>
                        {types.map(t => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
                    </select>
                </div>
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
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Building</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Floor</th>
                                    {isAdmin && <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map((r, i) => {
                                    const IconComp = getResourceIcon(r.resource_types.type_name);
                                    return (
                                        <motion.tr
                                            key={r.resource_id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.25 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                                        <IconComp size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{r.resource_name}</span>
                                                        {r.description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px]">{r.description}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/10">
                                                    {r.resource_types.type_name}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                    <Building2 size={13} className="text-slate-400" /> {r.buildings.building_name}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                                    <Layers size={13} className="text-slate-400" /> {r.floor_number ?? "—"}
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openForm(r)}
                                                            className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all active:scale-90">
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button onClick={() => handleDelete(r.resource_id)}
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
                            <Box className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {search || filterType ? "No resources match your search." : "No resources yet."}
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
                                    {editResource ? "Edit Resource" : "Add Resource"}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Resource Name *</label>
                                    <input type="text" value={formData.resource_name} onChange={(e) => setFormData({ ...formData, resource_name: e.target.value })}
                                        required placeholder="e.g. Computer Lab 1"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Type *</label>
                                        <select value={formData.type_id} onChange={(e) => setFormData({ ...formData, type_id: e.target.value })} required
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all">
                                            <option value="">Select type</option>
                                            {types.map(t => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Building *</label>
                                        <select value={formData.building_id} onChange={(e) => setFormData({ ...formData, building_id: e.target.value })} required
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all">
                                            <option value="">Select building</option>
                                            {buildings.map(b => <option key={b.building_id} value={b.building_id}>{b.building_name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Floor Number</label>
                                    <input type="number" value={formData.floor_number} onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                                        placeholder="e.g. 2" min="1"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Optional description" rows={2}
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
                                            : editResource ? "Save Changes" : "Add Resource"}
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
