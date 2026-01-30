import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const { email, password, role } = await request.json();

    const user = await prisma.users.findUnique({
        where: {
            email
        }
    })

    if (!user) {
        return NextResponse.json({ error: 'User does not exist' }, { status: 401 });
    }

    const isPassword = await compare(password, user.password)

    if (!isPassword) {
        return NextResponse.json({ error: 'Password is wrong' }, { status: 401 });
    }

    if (role && user.role !== role) {
        return NextResponse.json({ error: `Invalid role. You are registered as ${user.role}` }, { status: 401 });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
        { userId: user.user_id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    )

    const res = NextResponse.json({ "message": "Login successful" })

    res.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: Number(process.env.JWT_EXPIRES_IN)
    })

    return res;
}