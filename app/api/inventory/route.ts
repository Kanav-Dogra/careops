import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * CREATE INVENTORY ITEM
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
    const { name, quantity, threshold, vendorEmail } = body;

    if (
      !name ||
      quantity === undefined ||
      threshold === undefined ||
      !vendorEmail
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const item = await prisma.inventory.create({
      data: {
        name: String(name),
        quantity: Number(quantity),
        threshold: Number(threshold),
        vendorEmail: String(vendorEmail),
        businessId: user.businessId, // 🔥 SAFE
      },
    });

    return NextResponse.json({
      success: true,
      item,
    });

  } catch (error) {
    console.error("Inventory POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create inventory item" },
      { status: 500 }
    );
  }
}

/**
 * FETCH INVENTORY (BUSINESS SCOPED)
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

    const items = await prisma.inventory.findMany({
      where: { businessId: user.businessId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
