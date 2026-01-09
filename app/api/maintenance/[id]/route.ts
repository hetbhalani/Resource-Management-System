import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//get by id
export const GET = async (request: Request, {params} : {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const res = await prisma.maintenance.findFirst({
        where:{
            maintenance_id : parseInt(id)
        }
    })

    if (!res) {
        return new NextResponse(JSON.stringify({"message": "Maintenance not found"}), {status: 404});
    }

    return new NextResponse(JSON.stringify(res), {status: 200});
}

//delete maintenance
export const DELETE = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;

    try{
        const res = await prisma.maintenance.delete({
            where: {
                maintenance_id: parseInt(id)
            }
        })
        
        return new NextResponse(JSON.stringify({"message": "Maintenance deleted successfully"}), {status: 200})
    }
    catch(e){
        return new NextResponse(JSON.stringify({"message": "Error in maintenance delete"}), {status: 500})
    }
}

//update maintenance
export const PUT = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;
    const body = await request.json();

    try{
        const res = await prisma.maintenance.update({
            data: body,
            where: {
                maintenance_id: parseInt(id)
            }
        })
        return new NextResponse(JSON.stringify({"message": "Maintenance updated successfully", "data": res}), {status: 200})
    }
    catch(error){
        return new NextResponse(JSON.stringify({"message":"Maintenance update failed"}), {status: 500})
    }
}
