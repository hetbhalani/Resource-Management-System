import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all cupboards
export const GET = async () => {
    const res = await prisma.cupboards.findMany();
    return new NextResponse(JSON.stringify(res), { status: 200 });
}

// create new cupboard
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newCupboard = await prisma.cupboards.create({
            data: {
                resource_id: body.resource_id,
                cupboard_name: body.cupboard_name,
                total_shelves: body.total_shelves
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
