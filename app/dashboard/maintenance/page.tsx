"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wrench, Plus, Search, Loader2, Clock, X, Check,
    AlertTriangle, CheckCircle2, XCircle, Shield,
    ChevronLeft, ChevronRight, Building2, Layers, MapPin,
    ChevronRight as ChevronR, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/components/UserProvider";

/* ── Types ──────────────────────────────── */
interface MaintenanceRecord {
    maintenance_id: number;
    resource_id: number;
    reported_by: number | null;
    maintenance_type: string;
    scheduled_date: string;
    start_datetime: string | null;
    end_datetime: string | null;
    status: string;
    notes: string | null;
    resources: { resource_id: number; resource_name: string; resource_types?: { type_name: string }; buildings?: { building_name: string } };
    users: { user_id: number; name: string } | null;
}

interface Building { building_id: number; building_name: string; building_number: string | null; total_floors: number | null; }

interface Resource {
    resource_id: number; resource_name: string; floor_number: number | null;
    description: string | null; resource_types: { type_name: string }; buildings: { building_name: string };
    maintenance?: { maintenance_id: number; status: string }[];
}

const MAINTENANCE_TYPES = ["cleaning", "repairing", "servicing", "other"];

/* ── Time slots (same as bookings) ──────── */
const TIME_SLOTS = [
    { label: "7:45 – 9:30", startH: 7, startM: 45, endH: 9, endM: 30 },
    { label: "9:50 – 11:30", startH: 9, startM: 50, endH: 11, endM: 30 },
    { label: "12:10 – 1:50", startH: 12, startM: 10, endH: 13, endM: 50 },
];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekStart(date: Date): Date { const d = new Date(date); const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0, 0, 0, 0); return d; }
function addDays(date: Date, days: number): Date { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
function formatWeekRange(ws: Date): string { const end = addDays(ws, 5); const o: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }; return `${ws.toLocaleDateString("en-US", o)} – ${end.toLocaleDateString("en-US", { ...o, year: "numeric" })}`; }

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function MaintenancePage() {
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isMaintainer } = useUser();

    const fetchRecords = useCallback(async () => {
        try { const res = await fetch("/api/maintenance"); if (res.ok) setRecords(await res.json()); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    if (loading) {
        return (<div className="space-y-6">
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-96 animate-pulse" />
        </div>);
    }

    if (isMaintainer) return <MaintainerView records={records} fetchRecords={fetchRecords} />;
    return <RequesterView records={records} user={user} fetchRecords={fetchRecords} />;
}

/* ══════════════════════════════════════════
   REQUESTER VIEW (Student / Faculty / Admin)
   — List of recent maintenance + "Report Issue" button
   ══════════════════════════════════════════ */
function RequesterView({ records, user, fetchRecords }: { records: MaintenanceRecord[]; user: { userId: string; name: string; role: string } | null; fetchRecords: () => Promise<void> }) {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [showWizard, setShowWizard] = useState(false);

    // Show last 7 days + all pending/reported
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); sevenDaysAgo.setHours(0, 0, 0, 0);
    const visibleRecords = records.filter(r => {
        const d = new Date(r.scheduled_date);
        return d >= sevenDaysAgo || r.status === "reported" || r.status === "scheduled" || r.status === "in_progress";
    });

    const filtered = visibleRecords.filter(r => {
        const matchSearch = r.resources.resource_name.toLowerCase().includes(search.toLowerCase()) || r.maintenance_type.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "completed": return { icon: CheckCircle2, style: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/10" };
            case "in_progress": return { icon: Clock, style: "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 ring-1 ring-sky-500/10" };
            case "scheduled": return { icon: Calendar, style: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/10" };
            case "reported": return { icon: AlertTriangle, style: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 ring-1 ring-orange-500/10" };
            case "cancelled": return { icon: XCircle, style: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400" };
            default: return { icon: Clock, style: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400" };
        }
    };

    const formatDate = (dt: string) => new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formatTime = (dt: string) => new Date(dt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Maintenance</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Report issues with resources and track maintenance status</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowWizard(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-violet-600/20 transition-colors">
                    <Plus size={16} /> Report Issue
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
                    <option value="reported">Reported</option>
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
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date / Slot</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reported By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map((r, i) => {
                                    const sc = getStatusConfig(r.status);
                                    return (
                                        <motion.tr key={r.maintenance_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.25 }} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><Wrench size={16} /></div>
                                                    <div>
                                                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{r.resources.resource_name}</span>
                                                        {r.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px]">{r.notes}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/10 capitalize">{r.maintenance_type}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                                                {r.start_datetime && r.end_datetime ? (
                                                    <div><p className="text-xs">{formatDate(r.start_datetime)}</p><p className="text-[11px] text-slate-400">{formatTime(r.start_datetime)} – {formatTime(r.end_datetime)}</p></div>
                                                ) : formatDate(r.scheduled_date)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${sc.style}`}>{r.status.replace("_", " ")}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{r.users?.name || "—"}</td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">{search || filterStatus ? "No records match your filter." : "No maintenance records yet."}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Issue Wizard */}
            <AnimatePresence>
                {showWizard && <IssueWizardPopup onClose={() => setShowWizard(false)} onCreated={() => { setShowWizard(false); fetchRecords(); }} />}
            </AnimatePresence>
        </motion.div>
    );
}

/* ══════════════════════════════════════════
   MAINTAINER VIEW — All requests + Schedule / Cancel
   ══════════════════════════════════════════ */
function MaintainerView({ records, fetchRecords }: { records: MaintenanceRecord[]; fetchRecords: () => Promise<void> }) {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [schedulingRecord, setSchedulingRecord] = useState<MaintenanceRecord | null>(null);

    const handleCancel = async (id: number) => {
        try {
            const res = await fetch(`/api/maintenance/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "cancelled" }) });
            if (res.ok) { toast.success("Request cancelled"); fetchRecords(); }
        } catch { toast.error("Cancel failed"); }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "completed": return { style: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/10" };
            case "in_progress": return { style: "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 ring-1 ring-sky-500/10" };
            case "scheduled": return { style: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/10" };
            case "reported": return { style: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 ring-1 ring-orange-500/10" };
            case "cancelled": return { style: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400" };
            default: return { style: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400" };
        }
    };

    const formatDate = (dt: string) => new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formatTime = (dt: string) => new Date(dt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const filtered = records.filter(r => {
        const matchSearch = r.resources.resource_name.toLowerCase().includes(search.toLowerCase()) || r.maintenance_type.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || r.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Maintenance Requests</h1>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                        <Shield size={12} className="text-teal-600 dark:text-teal-400" />
                        <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400 uppercase">Maintainer</span>
                    </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Schedule or cancel maintenance requests</p>
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
                    <option value="reported">Reported</option>
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
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date / Slot</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reported By</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.map((r, i) => {
                                    const sc = getStatusConfig(r.status);
                                    const canAct = r.status === "reported" || r.status === "scheduled";
                                    return (
                                        <motion.tr key={r.maintenance_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03, duration: 0.25 }} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><Wrench size={16} /></div>
                                                    <div>
                                                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{r.resources.resource_name}</span>
                                                        {r.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px]">{r.notes}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/10 capitalize">{r.maintenance_type}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                                                {r.start_datetime && r.end_datetime ? (
                                                    <div><p className="text-xs">{formatDate(r.start_datetime)}</p><p className="text-[11px] text-slate-400">{formatTime(r.start_datetime)} – {formatTime(r.end_datetime)}</p></div>
                                                ) : <span className="text-xs text-slate-400">Not scheduled</span>}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${sc.style}`}>{r.status.replace("_", " ")}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{r.users?.name || "—"}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {canAct ? (
                                                        <>
                                                            {(r.status === "reported") && (
                                                                <button onClick={() => setSchedulingRecord(r)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-all active:scale-95" title="Schedule">
                                                                    <Calendar size={14} /> Schedule
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleCancel(r.maintenance_id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-all active:scale-95" title="Cancel">
                                                                <X size={14} /> Cancel
                                                            </button>
                                                        </>
                                                    ) : <span className="text-xs text-slate-400">—</span>}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">{search || filterStatus ? "No records match your filter." : "No maintenance requests yet."}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Timetable Popup */}
            <AnimatePresence>
                {schedulingRecord && (
                    <ScheduleTimetablePopup
                        record={schedulingRecord}
                        onClose={() => setSchedulingRecord(null)}
                        onScheduled={() => { setSchedulingRecord(null); fetchRecords(); }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ══════════════════════════════════════════
   ISSUE WIZARD (Building → Floor → Resource → Details)
   For faculty/student/admin to report an issue
   ══════════════════════════════════════════ */
function IssueWizardPopup({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [loadingBuildings, setLoadingBuildings] = useState(true);
    const [loadingResources, setLoadingResources] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [maintenanceType, setMaintenanceType] = useState("cleaning");
    const [notes, setNotes] = useState("");

    useEffect(() => { fetch("/api/buildings").then(r => r.json()).then(setBuildings).catch(console.error).finally(() => setLoadingBuildings(false)); }, []);
    useEffect(() => {
        if (selectedBuilding && selectedFloor !== null) {
            setLoadingResources(true);
            fetch(`/api/resources/by-location?building_id=${selectedBuilding.building_id}&floor_number=${selectedFloor}`)
                .then(r => r.json()).then(setResources).catch(console.error).finally(() => setLoadingResources(false));
        }
    }, [selectedBuilding, selectedFloor]);

    const handleSubmit = async () => {
        if (!selectedResource) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/maintenance", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resource_id: selectedResource.resource_id, maintenance_type: maintenanceType, status: "reported", notes: notes || null }),
            });
            if (res.ok) { toast.success("Issue reported!"); onCreated(); } else { const d = await res.json(); toast.error(d.error || "Failed"); }
        } catch { toast.error("Something went wrong"); } finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative z-10 w-full max-w-xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">Report Maintenance Issue</h3>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-all"><X size={18} /></button>
                    </div>
                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-3">
                        {[{ num: 1, label: "Building" }, { num: 2, label: "Floor" }, { num: 3, label: "Resource" }, { num: 4, label: "Details" }].map((s, idx, arr) => (
                            <React.Fragment key={s.num}>
                                <button onClick={() => { if (s.num < step) { setStep(s.num as 1 | 2 | 3 | 4); if (s.num <= 1) { setSelectedBuilding(null); setSelectedFloor(null); setSelectedResource(null); } if (s.num <= 2) { setSelectedFloor(null); setSelectedResource(null); } if (s.num <= 3) setSelectedResource(null); } }}
                                    disabled={s.num > step}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${step === s.num ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400" : step > s.num ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 cursor-pointer" : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"}`}>
                                    {step > s.num ? <Check size={11} /> : <span className="w-3.5 h-3.5 rounded-full bg-current/20 flex items-center justify-center text-[9px]">{s.num}</span>}
                                    {s.label}
                                </button>
                                {idx < arr.length - 1 && <div className={`flex-1 h-px transition-colors ${step > s.num ? "bg-emerald-300 dark:bg-emerald-700" : "bg-slate-200 dark:bg-slate-700"}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4 max-h-[50vh] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="space-y-2">
                                {loadingBuildings ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-violet-600" /></div> :
                                    buildings.map((b, i) => (
                                        <motion.button key={b.building_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            onClick={() => { setSelectedBuilding(b); setStep(2); }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all text-left active:scale-[0.98]">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Building2 size={16} /></div>
                                            <div className="flex-1"><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{b.building_name}</p><p className="text-[11px] text-slate-500 dark:text-slate-400">{b.building_number ? `#${b.building_number} • ` : ""}{b.total_floors ?? 0} floors</p></div>
                                            <ChevronR size={14} className="text-slate-400" />
                                        </motion.button>
                                    ))}
                            </motion.div>
                        )}
                        {step === 2 && selectedBuilding && (
                            <motion.div key="s2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="space-y-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-medium text-slate-700 dark:text-slate-300">{selectedBuilding.building_name}</span> — Select a floor</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {Array.from({ length: selectedBuilding.total_floors ?? 1 }, (_, i) => i + 1).map((floor, fi) => (
                                        <motion.button key={floor} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: fi * 0.04 }}
                                            onClick={() => { setSelectedFloor(floor); setStep(3); }}
                                            className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all active:scale-95">
                                            <Layers size={16} className="text-slate-500 dark:text-slate-400" /><span className="text-xs font-medium text-slate-700 dark:text-slate-200">Floor {floor}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="space-y-2">
                                <p className="text-xs text-slate-500 mb-2"><span className="font-medium text-slate-700 dark:text-slate-300">{selectedBuilding?.building_name}</span> • Floor {selectedFloor}</p>
                                {loadingResources ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-violet-600" /></div> :
                                    resources.length > 0 ? resources.map((r, ri) => {
                                        const underMaint = (r.maintenance?.length ?? 0) > 0;
                                        return (
                                            <motion.button key={r.resource_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.04 }}
                                                onClick={() => { if (!underMaint) { setSelectedResource(r); setStep(4); } }} disabled={underMaint}
                                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${underMaint ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 opacity-60 cursor-not-allowed" : "border-slate-200 dark:border-slate-700 hover:border-violet-300 active:scale-[0.98]"}`}>
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${underMaint ? "bg-slate-100 text-slate-400" : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"}`}><MapPin size={16} /></div>
                                                <div className="flex-1 min-w-0"><p className={`text-sm font-medium ${underMaint ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}`}>{r.resource_name}</p><p className="text-[11px] text-slate-500">{r.resource_types.type_name}</p></div>
                                                {underMaint ? <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Under Maintenance</span> : <ChevronR size={14} className="text-slate-400" />}
                                            </motion.button>
                                        );
                                    }) : <div className="text-center py-8"><Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">No resources on this floor</p></div>}
                            </motion.div>
                        )}
                        {step === 4 && selectedResource && (
                            <motion.div key="s4" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="space-y-4">
                                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700">
                                    <p className="text-sm font-medium text-violet-700 dark:text-violet-300">{selectedResource.resource_name}</p>
                                    <p className="text-[11px] text-violet-500">{selectedBuilding?.building_name} • Floor {selectedFloor}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Maintenance Type *</label>
                                    <select value={maintenanceType} onChange={e => setMaintenanceType(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all capitalize">
                                        {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Notes / Description</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe the issue..." rows={3}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setStep(3)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl transition-colors active:scale-[0.98]">Back</button>
                                    <button onClick={handleSubmit} disabled={submitting}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 active:scale-[0.98]">
                                        {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span> : "Report Issue"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    {step > 1 && step < 4 ? (
                        <button onClick={() => { if (step === 3) { setStep(2); setSelectedFloor(null); } else if (step === 2) { setStep(1); setSelectedBuilding(null); } }}
                            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">← Back</button>
                    ) : <div />}
                    <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">Cancel</button>
                </div>
            </motion.div>
        </div>
    );
}

/* ══════════════════════════════════════════
   SCHEDULE TIMETABLE POPUP (Maintainer picks a slot)
   ══════════════════════════════════════════ */
function ScheduleTimetablePopup({ record, onClose, onScheduled }: { record: MaintenanceRecord; onClose: () => void; onScheduled: () => void }) {
    const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
    const [weekDirection, setWeekDirection] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [allBookings, setAllBookings] = useState<{ start_datetime: string; end_datetime: string; status: string }[]>([]);
    const [allMaintenance, setAllMaintenance] = useState<{ start_datetime: string | null; end_datetime: string | null; status: string; maintenance_id: number }[]>([]);

    // Fetch existing bookings + maintenance for this specific resource
    useEffect(() => {
        fetch("/api/bookings").then(r => r.json()).then((bks: { resource_id: number; start_datetime: string; end_datetime: string; status: string }[]) => {
            setAllBookings(bks.filter(b => b.resource_id === record.resource_id && (b.status === "pending" || b.status === "approved")));
        }).catch(console.error);
        fetch("/api/maintenance").then(r => r.json()).then((ms: { resource_id: number; start_datetime: string | null; end_datetime: string | null; status: string; maintenance_id: number }[]) => {
            setAllMaintenance(ms.filter(m => m.resource_id === record.resource_id && (m.status === "scheduled" || m.status === "in_progress") && m.maintenance_id !== record.maintenance_id));
        }).catch(console.error);
    }, [record.resource_id, record.maintenance_id]);

    const navigateWeek = (dir: number) => { setWeekDirection(dir); setWeekStart(addDays(weekStart, dir * 7)); };
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const isSlotOccupied = (dayDate: Date, slot: typeof TIME_SLOTS[0]) => {
        const sS = new Date(dayDate); sS.setHours(slot.startH, slot.startM, 0, 0);
        const sE = new Date(dayDate); sE.setHours(slot.endH, slot.endM, 0, 0);
        const hasBooking = allBookings.some(b => new Date(b.start_datetime) < sE && new Date(b.end_datetime) > sS);
        const hasMaint = allMaintenance.some(m => m.start_datetime && m.end_datetime && new Date(m.start_datetime) < sE && new Date(m.end_datetime) > sS);
        return hasBooking || hasMaint;
    };

    const handleSlotSelect = async (dayIdx: number, slotIdx: number) => {
        const dayDate = addDays(weekStart, dayIdx);
        const slot = TIME_SLOTS[slotIdx];
        const startDt = new Date(dayDate); startDt.setHours(slot.startH, slot.startM, 0, 0);
        const endDt = new Date(dayDate); endDt.setHours(slot.endH, slot.endM, 0, 0);
        setSubmitting(true);
        try {
            const res = await fetch(`/api/maintenance/${record.maintenance_id}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "scheduled", scheduled_date: startDt.toISOString() }),
            });
            if (res.ok) { toast.success("Maintenance scheduled!"); onScheduled(); } else { toast.error("Failed to schedule"); }
        } catch { toast.error("Something went wrong"); } finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative z-10 w-full max-w-4xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800 dark:text-white">Schedule Maintenance</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{record.resources.resource_name}</span> • {record.maintenance_type} • Reported by {record.users?.name || "Unknown"}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-all"><X size={18} /></button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Week Navigator */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-2.5">
                        <button onClick={() => navigateWeek(-1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors active:scale-90"><ChevronLeft size={16} /></button>
                        <AnimatePresence mode="wait">
                            <motion.p key={weekStart.toISOString()} initial={{ opacity: 0, x: weekDirection * 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: weekDirection * -20 }}
                                className="text-sm font-semibold text-slate-800 dark:text-white">{formatWeekRange(weekStart)}</motion.p>
                        </AnimatePresence>
                        <button onClick={() => navigateWeek(1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors active:scale-90"><ChevronRight size={16} /></button>
                    </div>

                    {/* Timetable */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[650px]">
                            <thead>
                                <tr>
                                    <th className="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 border-b border-r border-slate-200 dark:border-slate-700 w-24">Slot</th>
                                    {DAY_NAMES.map((day, idx) => {
                                        const dd = addDays(weekStart, idx);
                                        const isToday = dd.toDateString() === new Date().toDateString();
                                        return (
                                            <th key={day} className={`px-2 py-3 text-center border-b border-r last:border-r-0 border-slate-200 dark:border-slate-700 ${isToday ? "bg-violet-50 dark:bg-violet-900/15" : "bg-slate-50 dark:bg-slate-900/50"}`}>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}`}>{day}</span>
                                                <p className={`text-[11px] mt-0.5 ${isToday ? "text-violet-500 font-semibold" : "text-slate-400"}`}>{dd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_SLOTS.map((slot, slotIdx) => (
                                    <tr key={slotIdx}>
                                        <td className="px-3 py-2.5 border-r border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{slot.label.split(" – ")[0]}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">to {slot.label.split(" – ")[1]}</p>
                                        </td>
                                        {DAY_NAMES.map((_, dayIdx) => {
                                            const dayDate = addDays(weekStart, dayIdx);
                                            const isPast = dayDate < today;
                                            const occupied = isSlotOccupied(dayDate, slot);
                                            const isToday = dayDate.toDateString() === new Date().toDateString();
                                            const cellBg = isToday ? "bg-violet-50/30 dark:bg-violet-900/5" : "";

                                            if (occupied) {
                                                return (
                                                    <td key={dayIdx} className={`border-r border-b last:border-r-0 border-slate-200 dark:border-slate-700 p-1.5 ${cellBg}`}>
                                                        <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 h-[80px] flex items-center justify-center">
                                                            <span className="text-[10px] font-semibold text-slate-400">Occupied</span>
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={dayIdx} className={`border-r border-b last:border-r-0 border-slate-200 dark:border-slate-700 p-1.5 ${cellBg}`}>
                                                    <button onClick={() => !isPast && !submitting && handleSlotSelect(dayIdx, slotIdx)}
                                                        disabled={isPast || submitting}
                                                        className={`w-full rounded-xl border border-dashed h-[80px] flex flex-col items-center justify-center gap-1 transition-all ${isPast
                                                            ? "border-slate-200 dark:border-slate-700 bg-slate-50/50 cursor-not-allowed"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:bg-teal-50/60 dark:hover:bg-teal-900/10 cursor-pointer group active:scale-[0.98]"}`}>
                                                        {!isPast && <>
                                                            <Wrench size={14} className="text-slate-300 group-hover:text-teal-500 dark:text-slate-600 transition-colors" />
                                                            <span className="text-[9px] font-medium text-slate-300 group-hover:text-teal-500 dark:text-slate-600 transition-colors uppercase tracking-wider">Schedule</span>
                                                        </>}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" /> Occupied</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded border border-dashed border-slate-300" /> Available</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
