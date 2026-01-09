import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//get by id
export const GET = async (request: Request, {params} : {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const res = await prisma.bookings.findFirst({
        where:{
            booking_id : parseInt(id)
        }
    })

    if (!res) {
        return new NextResponse(JSON.stringify({"message": "Booking not found"}), {status: 404});
    }

    return new NextResponse(JSON.stringify(res), {status: 200});
}

//delete booking
export const DELETE = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;

    try{
        const res = await prisma.bookings.delete({
            where: {
                booking_id: parseInt(id)
            }
        })
        
        return new NextResponse(JSON.stringify({"message": "Booking deleted successfully"}), {status: 200})
    }
    catch(e){
        return new NextResponse(JSON.stringify({"message": "Error in booking delete"}), {status: 500})
    }
}

//update booking
export const PUT = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;
    const body = await request.json();

    try{
        const res = await prisma.bookings.update({
            data: body,
            where: {
                booking_id: parseInt(id)
            }
        })
        return new NextResponse(JSON.stringify({"message": "Booking updated successfully", "data": res}), {status: 200})
    }
    catch(error){
        return new NextResponse(JSON.stringify({"message":"Booking update failed"}), {status: 500})
    }
}
