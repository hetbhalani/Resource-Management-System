import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

// get all bookings with related data
export const GET = async () => {
    const res = await prisma.bookings.findMany({
        include: {
            resources: true,
            users_bookings_user_idTousers: true,
            users_bookings_approver_idTousers: true,
        },
        orderBy: { created_at: "desc" }
    });
    return NextResponse.json(res);
}

// create new booking
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        // Get user from JWT
        const token = request.cookies.get("authToken")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = verifyToken(token);

        // Check for conflicting bookings on the same resource
        const conflict = await prisma.bookings.findFirst({
            where: {
                resource_id: body.resource_id,
                status: { in: ["pending", "approved"] },
                start_datetime: { lt: new Date(body.end_datetime) },
                end_datetime: { gt: new Date(body.start_datetime) },
            }
        });

        if (conflict) {
            return NextResponse.json(
                { error: "This resource is already booked for the selected time slot." },
                { status: 409 }
            );
        }

        const newBooking = await prisma.bookings.create({
            data: {
                resource_id: body.resource_id,
                user_id: Number(user.userId),
                start_datetime: new Date(body.start_datetime),
                end_datetime: new Date(body.end_datetime),
                status: "pending",
                created_at: new Date()
            },
            include: {
                resources: true,
                users_bookings_user_idTousers: true,
            }
        });

        return NextResponse.json(newBooking, { status: 201 });
    } catch (error) {
        console.error("create booking error:", error);
        return NextResponse.json(
            { error: "create booking failed" },
            { status: 500 }
        );
    }
}
