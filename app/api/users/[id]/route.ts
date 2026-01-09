import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//get by id
export const GET = async (request: Request, {params} : {params: Promise<{id: string}>}) => {
    const {id} = await params;

    const res = await prisma.users.findFirst({
        where:{
            user_id : parseInt(id)
        }
    })

    if (!res) {
        return new NextResponse(JSON.stringify({"message": "User not found"}), {status: 404});
    }

    return new NextResponse(JSON.stringify(res), {status: 200});
}

//delete user
export const DELETE = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;

    try{
        const res = await prisma.users.delete({
            where: {
                user_id: parseInt(id)
            }
        })
        
        return new NextResponse(JSON.stringify({"message": "User deleted successfully"}), {status: 200})
    }
    catch(e){
        return new NextResponse(JSON.stringify({"message": "Error in User delete"}), {status: 500})
    }
}

//update user
export const PUT = async (request: Request, {params}:{params: Promise<{id: string}>})=>{
    const {id} = await params;
    const body = await request.json();

    try{
        const res = await prisma.users.update({
            data: body,
            where: {
                user_id: parseInt(id)
            }
        })
        return new NextResponse(JSON.stringify({"message": "update user successfully", "data": res}), {status: 200})
    }
    catch(error){
        return new NextResponse(JSON.stringify({"message":"update user failed"}), {status: 500})
    }
}   