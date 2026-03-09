import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

// get all maintenance with related data
// Auto-complete: mark scheduled/in_progress records as completed once their end_datetime passes
export const GET = async () => {
    const now = new Date();

    // Auto-complete past maintenance
    await prisma.maintenance.updateMany({
        where: {
            status: { in: ["scheduled", "in_progress"] },
            scheduled_date: { lt: now },
        },
        data: { status: "completed" },
    });

    const res = await prisma.maintenance.findMany({
        include: {
            resources: {
                include: {
                    resource_types: true,
                    buildings: true,
                }
            }
        },
        orderBy: { scheduled_date: "desc" }
    });
    return NextResponse.json(res);
}

// create new maintenance
export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        // Get user from JWT
        const token = request.cookies.get("authToken")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const jwtUser = verifyToken(token);

        if (!body.resource_id) {
            return NextResponse.json({ error: 'resource_id is required' }, { status: 400 });
        }

        const resource = await prisma.resources.findUnique({ where: { resource_id: body.resource_id } });
        if (!resource) {
            return NextResponse.json({ error: 'resource not found' }, { status: 400 });
        }

        // Build scheduled_date: use provided or default to now (for "reported" issues)
        let scheduledDate: Date;
        if (body.start_datetime) {
            scheduledDate = new Date(body.start_datetime);
        } else if (body.scheduled_date) {
            scheduledDate = new Date(body.scheduled_date);
        } else {
            scheduledDate = new Date(); // default for reported issues
        }

        if (Number.isNaN(scheduledDate.getTime())) {
            return NextResponse.json({ error: 'invalid date' }, { status: 400 });
        }

        const newMaintenance = await prisma.maintenance.create({
            data: {
                resource_id: body.resource_id,
                maintenance_type: body.maintenance_type || "other",
                scheduled_date: scheduledDate,
                status: body.status || "reported",
                notes: body.notes || null
            },
            include: {
                resources: true
            }
        });

        return NextResponse.json(newMaintenance, { status: 201 });
    } catch (error) {
        console.error("create maintenance error:", error);
        return NextResponse.json({ error: "create maintenance failed", details: String(error) }, { status: 500 });
    }
}
