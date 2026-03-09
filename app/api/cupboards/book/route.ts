import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        // Get user from JWT
        const token = request.cookies.get("authToken")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const user = verifyToken(token);

        // Check if cupboard is already booked on that date
        const existingCupboard = await prisma.cupboards.findUnique({
            where: { cupboard_id: body.cupboard_id }
        });

        if (!existingCupboard) {
            return NextResponse.json({ error: "Cupboard not found" }, { status: 404 });
        }

        const requestedDate = body.date; // e.g. "2026-03-09"
        if (!requestedDate) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        const isAlreadyBooked = existingCupboard.user_id !== null && 
                                existingCupboard.booked_date !== null &&
                                new Date(existingCupboard.booked_date).toISOString().split('T')[0] === requestedDate;

        if (isAlreadyBooked) {
            return NextResponse.json({ error: "Cupboard is already booked for this date" }, { status: 409 });
        }

        // Book the cupboard
        const updatedCupboard = await prisma.cupboards.update({
            where: { cupboard_id: body.cupboard_id },
            data: {
                user_id: Number(user.userId),
                booked_date: new Date(requestedDate)
            }
        });

        return NextResponse.json(updatedCupboard, { status: 200 });

    } catch (error) {
        console.error("book cupboard error:", error);
        return NextResponse.json(
            { error: "book cupboard failed" },
            { status: 500 }
        );
    }
}
