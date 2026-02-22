import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all resources with related data
export const GET = async () => {
    const res = await prisma.resources.findMany({
        include: {
            resource_types: true,
            buildings: true,
        },
        orderBy: { resource_id: "desc" }
    });
    return NextResponse.json(res);
}

// create new resource
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        const newResource = await prisma.resources.create({
            data: {
                resource_name: body.resource_name,
                resource_type_id: body.resource_type_id,
                building_id: body.building_id,
                floor_number: body.floor_number || null,
                description: body.description || null
            },
            include: {
                resource_types: true,
                buildings: true,
            }
        });

        return NextResponse.json(newResource, { status: 201 });
    } catch (error) {
        console.error("create resource error:", error);
        return NextResponse.json(
            { error: "create resource failed" },
            { status: 500 }
        );
    }
}
