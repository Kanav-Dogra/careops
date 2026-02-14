import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessName, email, password } = body;

    if (!businessName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // Prevent duplicate user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Create business
    const business = await prisma.business.create({
      data: {
        name: businessName,
        email,
      },
    });

    // Create owner
    const user = await prisma.user.create({
      data: {
        email,
        password, // Hackathon demo (no hashing)
        role: "Owner",
        businessId: business.id,
      },
    });

    // Create response and set secure cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
