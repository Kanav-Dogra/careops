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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const businessId = await getBusinessFromSession();
    if (!businessId) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const rule = await prisma.automationRule.findUnique({
      where: { id },
    });

    if (!rule || rule.businessId !== businessId) {
      return NextResponse.json(
        { success: false },
        { status: 403 }
      );
    }

    const updated = await prisma.automationRule.update({
      where: { id },
      data: { active: !rule.active },
    });

    return NextResponse.json({
      success: true,
      rule: updated,
    });

  } catch (error) {
    console.error("PATCH Automation error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
