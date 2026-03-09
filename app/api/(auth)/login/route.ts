import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { prisma } from "@/lib/prisma";

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getCookieMaxAge() {
    const raw = process.env.JWT_EXPIRES_IN;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_COOKIE_MAX_AGE;
}

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

    const res = NextResponse.json({ "message": "Login successful", user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role } })

    res.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: getCookieMaxAge()
    })

    return res;
}