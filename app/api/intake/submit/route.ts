import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * PUBLIC INTAKE SUBMISSION
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, responses } = body;

    if (!bookingId || !responses) {
      return NextResponse.json(
        { success: false, message: "Booking ID and responses required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { intakeSubmission: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Invalid booking reference" },
        { status: 404 }
      );
    }

    // 🔥 Prevent duplicate submission
    if (booking.intakeSubmission) {
      return NextResponse.json(
        { success: false, message: "Form already submitted" },
        { status: 400 }
      );
    }

    await prisma.intakeSubmission.create({
      data: {
        bookingId,
        responses,
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        intakeSent: true,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Intake submission error:", error);
    return NextResponse.json(
      { success: false, message: "Submission failed" },
      { status: 500 }
    );
  }
}
