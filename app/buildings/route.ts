"use server"

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all users
export const GET = async () => {
    const res = await prisma.buildings.findMany();
    return new NextResponse(JSON.stringify(res));
}

// create new user
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newUser = await prisma.buildings.create({
            data: {
                building_name: body.building_name,
                building_number: body.building_number,
                total_floors: body.total_floors,
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("create user error:", error);
        return NextResponse.json(
            { error: "create user failed" },
            { status: 500 }
        );
    }
}
