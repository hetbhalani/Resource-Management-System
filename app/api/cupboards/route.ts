import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all cupboards, optionally filtered
export const GET = async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const minShelves = searchParams.get("minShelves");
        const dateStr = searchParams.get("date"); // e.g. "2026-03-09"
        const buildingId = searchParams.get("buildingId");

        const whereClause: any = {};

        if (minShelves) {
            whereClause.total_shelves = { gte: parseInt(minShelves) };
        }

        if (buildingId && buildingId !== "all") {
            whereClause.resources = {
                building_id: parseInt(buildingId)
            };
        }

        const res = await prisma.cupboards.findMany({
            where: whereClause,
            include: {
                resources: {
                    include: { buildings: true }
                },
                users: {
                    select: { name: true, email: true }
                }
            }
        });

        const cupboardsWithStatus = res.map(cupboard => {
            const isBookedForDate = dateStr && cupboard.booked_date
                ? new Date(cupboard.booked_date).toISOString().split('T')[0] === dateStr
                : false;

            return {
                ...cupboard,
                is_booked: isBookedForDate,
                // Hide user details if not booked for the selected date
                users: isBookedForDate ? cupboard.users : null,
                user_id: isBookedForDate ? cupboard.user_id : null,
                booked_date: isBookedForDate ? cupboard.booked_date : null
            };
        });

        return NextResponse.json(cupboardsWithStatus, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "fetch cupboards failed" }, { status: 500 });
    }
}

// create new cupboard
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newCupboard = await prisma.cupboards.create({
            data: {
                resources: {
                    connect: { resource_id: body.resource_id }
                },
                cupboard_name: body.cupboard_name,
                total_shelves: body.total_shelves || null
            },
            include: {
                resources: {
                    include: { buildings: true }
                }
            }
        });

        return NextResponse.json(newCupboard, { status: 201 });
    } catch (error) {
        console.error("create cupboard error:", error);
        return NextResponse.json(
            { error: "create cupboard failed" },
            { status: 500 }
        );
    }
}
