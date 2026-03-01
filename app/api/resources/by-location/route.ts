import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/resources/by-location?building_id=X&floor_number=Y
export const GET = async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const buildingId = searchParams.get("building_id");
        const floorNumber = searchParams.get("floor_number");

        if (!buildingId) {
            return NextResponse.json(
                { error: "building_id is required" },
                { status: 400 }
            );
        }

        const where: Record<string, unknown> = {
            building_id: Number(buildingId),
        };

        if (floorNumber !== null && floorNumber !== undefined && floorNumber !== "") {
            where.floor_number = Number(floorNumber);
        }

        const resources = await prisma.resources.findMany({
            where,
            include: {
                resource_types: true,
                buildings: true,
                facilities: true,
            },
            orderBy: { resource_name: "asc" },
        });

        return NextResponse.json(resources);
    } catch (error) {
        console.error("Resources by location error:", error);
        return NextResponse.json(
            { error: "Failed to fetch resources" },
            { status: 500 }
        );
    }
};
