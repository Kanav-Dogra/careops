import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Create Team Member (Owner Only)
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    if (currentUser.role !== "Owner") {
      return NextResponse.json(
        { success: false, message: "Only Owner can add team members" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // hackathon demo
        role,
        businessId: currentUser.businessId, // 🔥 SAFE
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Team POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}

/**
 * Fetch Team Members (Owner Only)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        businessId: currentUser.businessId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
