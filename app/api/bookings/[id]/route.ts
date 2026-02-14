import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

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

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking || booking.businessId !== user?.businessId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: body.status },
    });

    // 🔥 If marked completed
    if (body.status === "Completed") {
      try {
        await sendEmail(
          updatedBooking.email,
          "Thank You for Visiting",
          "Thank you for your appointment. We look forward to serving you again."
        );
      } catch (e) {
        console.error("Completion email failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });

  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking || booking.businessId !== user?.businessId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Booking DELETE error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
