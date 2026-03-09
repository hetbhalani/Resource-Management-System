import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { hash } from 'bcryptjs';
import { prisma } from "@/lib/prisma";

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getCookieMaxAge() {
    const raw = process.env.JWT_EXPIRES_IN;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_COOKIE_MAX_AGE;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Only student and faculty can sign up — admin and maintainer are pre-seeded
        if (body.role === 'admin') {
            return NextResponse.json(
                { error: 'Admin accounts cannot be created via signup' },
                { status: 403 }
            );
        }

        const user = await prisma.users.findUnique({
            where: {
                email: body.email
            }
        })

        if (user) {
            return NextResponse.json({ 'error': 'User already exist' }, { status: 401 })
        }

        // Hash the password before storing
        const hashedPassword = await hash(body.password, 10);

        const requestedRole = body.role;
        const normalizedRole = requestedRole === "student" || requestedRole === "faculty" || requestedRole === "maintainer"
            ? requestedRole
            : "faculty";

        const newUser = await prisma.users.create({
            data: {
                name: body.name,
                email: body.email,
                role: normalizedRole,
                password: hashedPassword,
            }
        })

        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        const token = jwt.sign(
            { userId: newUser.user_id, email: newUser.email, name: newUser.name, role: newUser.role },
            process.env.JWT_SECRET!,
            { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
        );

        const res = NextResponse.json(
            { message: "User created successfully", user: { user_id: newUser.user_id, name: newUser.name, email: newUser.email, role: newUser.role } },
            { status: 201 }
        );

        res.cookies.set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: getCookieMaxAge()
        });

        return res;
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Signup failed" },
            { status: 500 }
        );
    }
}