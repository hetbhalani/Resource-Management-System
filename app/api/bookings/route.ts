"use server"

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all bookings
export const GET = async () => {
    const res = await prisma.bookings.findMany();
    return new NextResponse(JSON.stringify(res), {status: 200});
}

// create new booking
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newBooking = await prisma.bookings.create({
            data: {
                resource_id: body.resource_id,
                user_id: body.user_id,
                start_datetime: body.start_datetime,
                end_datetime: body.end_datetime,
                status: body.status,
                approver_id: body.approver_id,
                created_at: new Date()
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
