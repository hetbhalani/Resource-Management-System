import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all shelves
export const GET = async () => {
    const res = await prisma.shelves.findMany();
    return new NextResponse(JSON.stringify(res), { status: 200 });
}

// create new shelf
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newShelf = await prisma.shelves.create({
            data: {
                cupboard_id: body.cupboard_id,
                shelf_number: body.shelf_number,
                capacity: body.capacity,
                description: body.description
            }
        });

        return NextResponse.json(newShelf, { status: 201 });
    } catch (error) {
        console.error("create shelf error:", error);
        return NextResponse.json(
            { error: "create shelf failed" },
            { status: 500 }
        );
    }
}
