import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";

/**
 * UPDATE INVENTORY
 */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID missing" },
        { status: 400 }
      );
    }

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
    const { quantity } = body;

    const item = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    // 🔥 MULTI-TENANT PROTECTION
    if (item.businessId !== user.businessId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const updatedItem = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: Number(quantity),
      },
    });

    // 🔥 AUTOMATION: Inventory threshold
    if (updatedItem.quantity <= updatedItem.threshold) {
      const rule = await prisma.automationRule.findFirst({
        where: {
          businessId: updatedItem.businessId,
          trigger: "Inventory Below Threshold",
          active: true,
        },
      });

      if (rule) {
        try {
          await sendEmail(
            updatedItem.vendorEmail,
            "Inventory Low Alert",
            `Item ${updatedItem.name} is below threshold.
Current quantity: ${updatedItem.quantity}`
          );
        } catch (e) {
          console.error("Vendor alert failed:", e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });

  } catch (error) {
    console.error("Inventory PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE INVENTORY
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Item ID missing" },
        { status: 400 }
      );
    }

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

    const item = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    if (item.businessId !== user.businessId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.inventory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Item deleted",
    });

  } catch (error) {
    console.error("Inventory DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}
