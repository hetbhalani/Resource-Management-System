import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//get by id
export const GET = async (request: Request, {params} : {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const res = await prisma.resources.findFirst({
        where:{
            resource_id : parseInt(id)
        }
    })

    if (!res) {
        return new NextResponse(JSON.stringify({"message": "Resource not found"}), {status: 404});
    }

    return new NextResponse(JSON.stringify(res), {status: 200});
}

//delete resource
export const DELETE = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;

    try{
        const res = await prisma.resources.delete({
            where: {
                resource_id: parseInt(id)
            }
        })
        
        return new NextResponse(JSON.stringify({"message": "Resource deleted successfully"}), {status: 200})
    }
    catch(e){
        return new NextResponse(JSON.stringify({"message": "Error in resource delete"}), {status: 500})
    }
}

//update resource
export const PUT = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;
    const body = await request.json();

    try{
        const res = await prisma.resources.update({
            data: body,
            where: {
                resource_id: parseInt(id)
            }
        })
        return new NextResponse(JSON.stringify({"message": "Resource updated successfully", "data": res}), {status: 200})
    }
    catch(error){
        return new NextResponse(JSON.stringify({"message":"Resource update failed"}), {status: 500})
    }
}
