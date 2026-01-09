import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//get by id
export const GET = async (request: Request, {params} : {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const res = await prisma.shelves.findFirst({
        where:{
            shelf_id : parseInt(id)
        }
    })

    if (!res) {
        return new NextResponse(JSON.stringify({"message": "Shelf not found"}), {status: 404});
    }

    return new NextResponse(JSON.stringify(res), {status: 200});
}

//delete shelf
export const DELETE = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;

    try{
        const res = await prisma.shelves.delete({
            where: {
                shelf_id: parseInt(id)
            }
        })
        
        return new NextResponse(JSON.stringify({"message": "Shelf deleted successfully"}), {status: 200})
    }
    catch(e){
        return new NextResponse(JSON.stringify({"message": "Error in shelf delete"}), {status: 500})
    }
}

//update shelf
export const PUT = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;
    const body = await request.json();

    try{
        const res = await prisma.shelves.update({
            data: body,
            where: {
                shelf_id: parseInt(id)
            }
        })
        return new NextResponse(JSON.stringify({"message": "Shelf updated successfully", "data": res}), {status: 200})
    }
    catch(error){
        return new NextResponse(JSON.stringify({"message":"Shelf update failed"}), {status: 500})
    }
}
