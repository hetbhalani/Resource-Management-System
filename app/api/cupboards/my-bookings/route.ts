import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
    try {
        const userIdHeader = request.headers.get('x-user-id');
        if (!userIdHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const myBookings = await prisma.cupboards.findMany({
            where: {
                user_id: parseInt(userIdHeader),
                booked_date: { not: null }
            },
            select: {
                booked_date: true
            }
        });

        const bookedDates = myBookings.map(b => b.booked_date?.toISOString().split('T')[0]);
        return NextResponse.json(bookedDates);
    } catch (error) {
        console.error("Fetch user cupboard bookings error:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}
