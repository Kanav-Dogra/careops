import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * CREATE INTAKE FORM (OWNER ONLY)
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

    if (!user || user.role !== "Owner") {
      return NextResponse.json(
        { success: false, message: "Only Owner can create intake forms" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, fields } = body;

    if (!title || !fields) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const form = await prisma.intakeForm.create({
      data: {
        title,
        fields,
        businessId: user.businessId, // 🔥 SAFE
      },
    });

    return NextResponse.json({ success: true, form });

  } catch (error) {
    console.error("Intake POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create form" },
      { status: 500 }
    );
  }
}

/**
 * FETCH FORMS (BUSINESS SCOPED)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const forms = await prisma.intakeForm.findMany({
      where: { businessId: user.businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(forms);

  } catch (error) {
    console.error("Intake GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}
