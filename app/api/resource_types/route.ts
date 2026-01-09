"use server"

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all resource_types
export const GET = async () => {
    const res = await prisma.resource_types.findMany();
    return new NextResponse(JSON.stringify(res));
}

// create new resource_types
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newResourceType = await prisma.resource_types.create({
            data: {
                type_name: body.type_name
            }
        });

        return NextResponse.json(newResourceType, { status: 201 });
    } catch (error) {
        console.error("create user error:", error);
        return NextResponse.json(
            { error: "create user failed" },
            { status: 500 }
        );
    }
}

