"use server"

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all buildings
export const GET = async () => {
    const res = await prisma.buildings.findMany();
    return new NextResponse(JSON.stringify(res), {status: 200});
}

// create new building
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newBuilding = await prisma.buildings.create({
            data: {
                building_name: body.building_name,
                building_number: body.building_number,
                total_floors: body.total_floors,
            }
        });

        return NextResponse.json(newBuilding, { status: 201 });
    } catch (error) {
        console.error("create building error:", error);
        return NextResponse.json(
            { error: "create building failed" },
            { status: 500 }
        );
    }
}
