import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//get by id
export const GET = async (request: Request, {params} : {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const res = await prisma.resource_types.findFirst({
        where:{
            resource_type_id : parseInt(id)
        }
    })

    if (!res) {
        return new NextResponse(JSON.stringify({"message": "Resource type not found"}), {status: 404});
    }

    return new NextResponse(JSON.stringify(res), {status: 200});
}

//delete resource type
export const DELETE = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;

    try{
        const res = await prisma.resource_types.delete({
            where: {
                resource_type_id: parseInt(id)
            }
        })
        
        return new NextResponse(JSON.stringify({"message": "Resource type deleted successfully"}), {status: 200})
    }
    catch(e){
        return new NextResponse(JSON.stringify({"message": "Error in resource type delete"}), {status: 500})
    }
}

//update resource type
export const PUT = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;
    const body = await request.json();

    try{
        const res = await prisma.resource_types.update({
            data: body,
            where: {
                resource_type_id: parseInt(id)
            }
        })
        return new NextResponse(JSON.stringify({"message": "Resource type updated successfully", "data": res}), {status: 200})
    }
    catch(error){
        return new NextResponse(JSON.stringify({"message":"Resource type update failed"}), {status: 500})
    }
}   