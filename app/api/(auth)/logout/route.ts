import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ message: "Logged out successfully" });
    
    res.cookies.set("authToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0, // This deletes the cookie
    });

    return res;
}
