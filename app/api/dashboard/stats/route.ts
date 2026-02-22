import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const [
            totalResources,
            totalBookings,
            pendingBookings,
            activeMaintenanceCount,
            totalUsers,
            recentBookings
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
            })
        ]);

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
            }))
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
};
