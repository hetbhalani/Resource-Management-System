import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all facilities
export const GET = async () => {
    const res = await prisma.facilities.findMany();
    return new NextResponse(JSON.stringify(res), { status: 200 });
}

// create new facility
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newFacility = await prisma.facilities.create({
            data: {
                resource_id: body.resource_id,
                facility_name: body.facility_name,
                details: body.details
            }
        });

        return NextResponse.json(newFacility, { status: 201 });
    } catch (error) {
        console.error("create facility error:", error);
        return NextResponse.json(
            { error: "create facility failed" },
            { status: 500 }
        );
    }
}
