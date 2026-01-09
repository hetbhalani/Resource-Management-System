import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//get by id
export const GET = async (request: Request, {params} : {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const res = await prisma.facilities.findFirst({
        where:{
            facility_id : parseInt(id)
        }
    })

    if (!res) {
        return new NextResponse(JSON.stringify({"message": "Facility not found"}), {status: 404});
    }

    return new NextResponse(JSON.stringify(res), {status: 200});
}

//delete facility
export const DELETE = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;

    try{
        const res = await prisma.facilities.delete({
            where: {
                facility_id: parseInt(id)
            }
        })
        
        return new NextResponse(JSON.stringify({"message": "Facility deleted successfully"}), {status: 200})
    }
    catch(e){
        return new NextResponse(JSON.stringify({"message": "Error in facility delete"}), {status: 500})
    }
}

//update facility
export const PUT = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;
    const body = await request.json();

    try{
        const res = await prisma.facilities.update({
            data: body,
            where: {
                facility_id: parseInt(id)
            }
        })
        return new NextResponse(JSON.stringify({"message": "Facility updated successfully", "data": res}), {status: 200})
    }
    catch(error){
        return new NextResponse(JSON.stringify({"message":"Facility update failed"}), {status: 500})
    }
}
