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

// 🔍 GET Availability
export async function GET() {
  try {
    const businessId = await getBusinessFromSession();

    if (!businessId) return NextResponse.json([]);

    const availability = await prisma.availability.findMany({
      where: { businessId },
      orderBy: { day: "asc" },
    });

    return NextResponse.json(availability);

  } catch (error) {
    console.error("GET availability error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// ➕ CREATE / UPDATE Availability
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { day, startTime, endTime } = body;

    if (!day || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const businessId = await getBusinessFromSession();

    if (!businessId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Prevent invalid range
    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, message: "Invalid time range" },
        { status: 400 }
      );
    }

    const existing = await prisma.availability.findFirst({
      where: {
        businessId,
        day,
      },
    });

    let result;

    if (existing) {
      result = await prisma.availability.update({
        where: { id: existing.id },
        data: { startTime, endTime },
      });
    } else {
      result = await prisma.availability.create({
        data: {
          day,
          startTime,
          endTime,
          businessId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      availability: result,
    });

  } catch (error) {
    console.error("POST availability error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save availability" },
      { status: 500 }
    );
  }
}
