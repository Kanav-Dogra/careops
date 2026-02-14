import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Create Lead
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        message,
        status: "New",
        businessId: user.businessId, // 🔥 Safe
      },
    });

    return NextResponse.json({
      success: true,
      lead,
    });

  } catch (error) {
    console.error("Lead POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create lead" },
      { status: 500 }
    );
  }
}

/**
 * Fetch Leads (Business Scoped)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json([], { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    const leads = await prisma.lead.findMany({
      where: { businessId: user.businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);

  } catch (error) {
    console.error("Lead GET error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
