"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Box, Plus, Search, Edit2, Trash2, X, Loader2, Building2, Tags, Shield } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

interface Resource {
    resource_id: number;
    resource_name: string;
    resource_type_id: number;
    building_id: number;
    floor_number: number | null;
    description: string | null;
    resource_types: { resource_type_id: number; type_name: string };
    buildings: { building_id: number; building_name: string; building_number: string | null };
}

interface ResourceType { resource_type_id: number; type_name: string; }
interface Building { building_id: number; building_name: string; building_number: string | null; total_floors: number | null; }

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Resource | null>(null);
    const [saving, setSaving] = useState(false);
    const { isAdmin } = useUser();

    const [form, setForm] = useState({
        resource_name: "", resource_type_id: "", building_id: "", floor_number: "", description: "",
    });

    const fetchResources = useCallback(async () => {
        try {
            const res = await fetch("/api/resources");
            if (res.ok) setResources(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchResources();
        fetch("/api/resource_types").then(r => r.json()).then(setResourceTypes).catch(console.error);
        fetch("/api/buildings").then(r => r.json()).then(setBuildings).catch(console.error);
    }, [fetchResources]);

    const openAdd = () => {
        setEditing(null);
        setForm({ resource_name: "", resource_type_id: "", building_id: "", floor_number: "", description: "" });
        setShowModal(true);
    };

    const openEdit = (r: Resource) => {
        setEditing(r);
        setForm({
            resource_name: r.resource_name,
            resource_type_id: String(r.resource_type_id),
            building_id: String(r.building_id),
            floor_number: r.floor_number ? String(r.floor_number) : "",
            description: r.description || "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;
        setSaving(true);
        const body = {
            resource_name: form.resource_name,
            resource_type_id: Number(form.resource_type_id),
            building_id: Number(form.building_id),
            floor_number: form.floor_number ? Number(form.floor_number) : null,
            description: form.description || null,
        };
        try {
            const url = editing ? `/api/resources/${editing.resource_id}` : "/api/resources";
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (res.ok) {
                toast.success(editing ? "Resource updated" : "Resource created");
                setShowModal(false);
                fetchResources();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save");
            }
        } catch {
            toast.error("Something went wrong");
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) return;
        if (!confirm("Are you sure you want to delete this resource?")) return;
        try {
            const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("Resource deleted"); fetchResources(); }
        } catch { toast.error("Delete failed"); }
    };

    const filtered = resources.filter(r => {
        const matchSearch = r.resource_name.toLowerCase().includes(search.toLowerCase()) ||
            r.buildings.building_name.toLowerCase().includes(search.toLowerCase());
        const matchType = !filterType || r.resource_type_id === Number(filterType);
        return matchSearch && matchType;
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
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Resources</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <Shield size={12} className="text-rose-600 dark:text-rose-400" />
                            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase">Admin Only</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Add, edit, and manage all organizational resources.</p>
                </div>
                {isAdmin && (
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors shadow-sm">
                        <Plus size={18} /> Add Resource
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                    <option value="">All Types</option>
                    {resourceTypes.map(t => <option key={t.resource_type_id} value={t.resource_type_id}>{t.type_name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {filtered.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-left">
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Building</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Floor</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                                    {isAdmin && <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map((r) => (
                                    <tr key={r.resource_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                                    <Box size={16} className="text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{r.resource_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                                                <Tags size={12} /> {r.resource_types.type_name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                <Building2 size={14} className="text-slate-400" /> {r.buildings.building_name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{r.floor_number ?? "—"}</td>
                                        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{r.description || "—"}</td>
                                        {isAdmin && (
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(r.resource_id)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Box className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {search || filterType ? "No resources match your search." : "No resources yet. Add your first resource!"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Admin only */}
            {showModal && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{editing ? "Edit Resource" : "Add Resource"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Resource Name *</label>
                                <input required value={form.resource_name} onChange={(e) => setForm({ ...form, resource_name: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                    placeholder="e.g. Conference Room A" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Resource Type *</label>
                                    <select required value={form.resource_type_id} onChange={(e) => setForm({ ...form, resource_type_id: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                        <option value="">Select type</option>
                                        {resourceTypes.map(t => <option key={t.resource_type_id} value={t.resource_type_id}>{t.type_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Building *</label>
                                    <select required value={form.building_id} onChange={(e) => setForm({ ...form, building_id: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                        <option value="">Select building</option>
                                        {buildings.map(b => <option key={b.building_id} value={b.building_id}>{b.building_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Floor Number</label>
                                <input type="number" value={form.floor_number} onChange={(e) => setForm({ ...form, floor_number: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                    placeholder="e.g. 2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                                    placeholder="Optional description..." />
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
