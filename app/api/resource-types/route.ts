import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all resource_types with resource count
export const GET = async () => {
    const res = await prisma.resource_types.findMany({
        orderBy: { resource_type_id: "desc" },
        include: {
            _count: {
                select: { resources: true }
            }
        }
    });
    return NextResponse.json(res);
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
        console.error("create resource type error:", error);
        return NextResponse.json(
            { error: "create resource type failed" },
            { status: 500 }
        );
    }
}
