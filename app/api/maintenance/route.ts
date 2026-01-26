import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// get all maintenance
export const GET = async () => {
    const res = await prisma.maintenance.findMany();
    return new NextResponse(JSON.stringify(res), { status: 200 });
}

// create new maintenance
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        // validate foreign key: resource must exist
        if (!body.resource_id) {
            return NextResponse.json({ error: 'resource_id is required' }, { status: 400 });
        }

        const resource = await prisma.resources.findUnique({ where: { resource_id: body.resource_id } });
        if (!resource) {
            return NextResponse.json({ error: 'resource not found' }, { status: 400 });
        }

        // validate scheduled_date is required
        if (!body.scheduled_date) {
            return NextResponse.json({ error: 'scheduled_date is required' }, { status: 400 });
        }

        const scheduledDate = new Date(body.scheduled_date);
        if (Number.isNaN(scheduledDate.getTime())) {
            return NextResponse.json({ error: 'invalid scheduled_date' }, { status: 400 });
        }

        const newMaintenance = await prisma.maintenance.create({
            data: {
                resource_id: body.resource_id,
                maintenance_type: body.maintenance_type,
                scheduled_date: scheduledDate,
                status: body.status,
                notes: body.notes
            }
        });

        return NextResponse.json(newMaintenance, { status: 201 });
    } catch (error) {
        console.error("create maintenance error:", error);
        return NextResponse.json({ error: "create maintenance failed", details: String(error) }, { status: 500 });
    }
}
