import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//get by id
export const GET = async (request: Request, {params} : {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const res = await prisma.cupboards.findFirst({
        where:{
            cupboard_id : parseInt(id)
        }
    })

    if (!res) {
        return new NextResponse(JSON.stringify({"message": "Cupboard not found"}), {status: 404});
    }

    return new NextResponse(JSON.stringify(res), {status: 200});
}

//delete cupboard
export const DELETE = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;

    try{
        const res = await prisma.cupboards.delete({
            where: {
                cupboard_id: parseInt(id)
            }
        })
        
        return new NextResponse(JSON.stringify({"message": "Cupboard deleted successfully"}), {status: 200})
    }
    catch(e){
        return new NextResponse(JSON.stringify({"message": "Error in cupboard delete"}), {status: 500})
    }
}

//update cupboard
export const PUT = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;
    const body = await request.json();

    try{
        const res = await prisma.cupboards.update({
            data: body,
            where: {
                cupboard_id: parseInt(id)
            }
        })
        return new NextResponse(JSON.stringify({"message": "Cupboard updated successfully", "data": res}), {status: 200})
    }
    catch(error){
        return new NextResponse(JSON.stringify({"message":"Cupboard update failed"}), {status: 500})
    }
}
