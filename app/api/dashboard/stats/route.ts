import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export const GET = async (request: NextRequest) => {
    try {
        const token = request.cookies.get("authToken")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        const isAdmin = decoded.role === "admin";

        if (isAdmin) {
            // Admin: global stats + chart data
            const [
                totalResources,
                totalBookings,
                pendingBookings,
                activeMaintenanceCount,
                totalUsers,
                recentBookings,
                approvedBookings,
                rejectedBookings,
                cancelledBookings,
                allBookings,
                resourceTypeCounts,
            ] = await Promise.all([
                prisma.resources.count(),
                prisma.bookings.count(),
                prisma.bookings.count({ where: { status: "pending" } }),
                prisma.maintenance.count({ where: { status: { in: ["scheduled", "in-progress"] } } }),
                prisma.users.count(),
                prisma.bookings.findMany({
                    take: 5,
                    orderBy: { created_at: "desc" },
                    include: {
                        resources: true,
                        users_bookings_user_idTousers: true,
                    }
                }),
                prisma.bookings.count({ where: { status: "approved" } }),
                prisma.bookings.count({ where: { status: "rejected" } }),
                prisma.bookings.count({ where: { status: "cancelled" } }),
                prisma.bookings.findMany({
                    select: { created_at: true, status: true },
                    orderBy: { created_at: "asc" },
                }),
                prisma.resource_types.findMany({
                    include: { _count: { select: { resources: true } } },
                }),
            ]);

            // Build weekly trend (last 8 weeks)
            const weeklyTrend: { week: string; bookings: number; approved: number }[] = [];
            const now = new Date();
            for (let i = 7; i >= 0; i--) {
                const weekEnd = new Date(now);
                weekEnd.setDate(now.getDate() - i * 7);
                weekEnd.setHours(23, 59, 59, 999);
                const weekStart = new Date(weekEnd);
                weekStart.setDate(weekEnd.getDate() - 6);
                weekStart.setHours(0, 0, 0, 0);

                const weekBookings = allBookings.filter(b => {
                    const d = b.created_at ? new Date(b.created_at) : null;
                    return d && d >= weekStart && d <= weekEnd;
                });

                const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                weeklyTrend.push({
                    week: label,
                    bookings: weekBookings.length,
                    approved: weekBookings.filter(b => b.status === "approved").length,
                });
            }

            // Resource type distribution
            const resourceTypeDistribution = resourceTypeCounts.map(rt => ({
                name: rt.type_name,
                value: rt._count.resources,
            }));

            return NextResponse.json({
                totalResources,
                totalBookings,
                pendingBookings,
                activeMaintenanceCount,
                totalUsers,
                recentBookings: recentBookings.map(b => ({
                    booking_id: b.booking_id,
                    resource_name: b.resources.resource_name,
                    user_name: b.users_bookings_user_idTousers.name,
                    start_datetime: b.start_datetime,
                    end_datetime: b.end_datetime,
                    status: b.status,
                    created_at: b.created_at,
                })),
                // Chart data
                bookingsByStatus: {
                    approved: approvedBookings,
                    pending: pendingBookings,
                    rejected: rejectedBookings,
                    cancelled: cancelledBookings,
                },
                weeklyTrend,
                resourceTypeDistribution,
            });
        } else {
            // Student/Faculty: user-specific stats
            const userId = Number(decoded.userId);
            const now = new Date();

            const [
                myTotalBookings,
                myPendingBookings,
                myUpcomingBookings,
                myRecentBookings
            ] = await Promise.all([
                prisma.bookings.count({ where: { user_id: userId } }),
                prisma.bookings.count({ where: { user_id: userId, status: "pending" } }),
                prisma.bookings.count({
                    where: {
                        user_id: userId,
                        status: { in: ["approved", "pending"] },
                        start_datetime: { gte: now }
                    }
                }),
                prisma.bookings.findMany({
                    where: { user_id: userId },
                    take: 10,
                    orderBy: { created_at: "desc" },
                    include: {
                        resources: {
                            include: {
                                buildings: true,
                            }
                        },
                    }
                })
            ]);

            return NextResponse.json({
                myTotalBookings,
                myPendingBookings,
                myUpcomingBookings,
                myRecentBookings: myRecentBookings.map(b => ({
                    booking_id: b.booking_id,
                    resource_name: b.resources.resource_name,
                    building_name: b.resources.buildings.building_name,
                    floor_number: b.resources.floor_number,
                    start_datetime: b.start_datetime,
                    end_datetime: b.end_datetime,
                    status: b.status,
                    created_at: b.created_at,
                }))
            });
        }
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
};
