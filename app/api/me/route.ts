import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("authToken")?.value;
    console.log(token)
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    return NextResponse.json(
      {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
    },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
