import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getBusinessFromSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return user.businessId;
}

// GET ALL RULES (Scoped to business)
export async function GET() {
  try {
    const businessId = await getBusinessFromSession();
    if (!businessId) return NextResponse.json([]);

    const rules = await prisma.automationRule.findMany({
      where: { businessId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(rules);

  } catch (error) {
    console.error("GET Automations error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}

// CREATE RULE (Owner Only)
export async function POST(req: Request) {
  try {
    const businessId = await getBusinessFromSession();

    if (!businessId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { trigger, action } = body;

    if (!trigger || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const rule = await prisma.automationRule.create({
      data: {
        trigger,
        action,
        businessId,
        active: true,
      },
    });

    return NextResponse.json({ success: true, rule });

  } catch (error) {
    console.error("POST Automations error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
