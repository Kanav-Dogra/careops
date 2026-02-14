import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";

function getDayName(date: string) {
  const bookingDate = new Date(date + "T00:00:00");
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[bookingDate.getDay()];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, time, email } = body;

    if (!date || !time || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔐 Auth check
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

    const businessId = user.businessId;

    // 🔥 Prevent past booking
    const now = new Date();
    const selectedDate = new Date(`${date}T${time}`);

    if (selectedDate < now) {
      return NextResponse.json(
        { success: false, message: "Cannot book past time slot" },
        { status: 400 }
      );
    }

    const dayName = getDayName(date);

    // 🔍 Check availability
    const availability = await prisma.availability.findFirst({
      where: {
        businessId,
        day: dayName,
      },
    });

    if (!availability) {
      return NextResponse.json(
        { success: false, message: "Business closed on selected day" },
        { status: 400 }
      );
    }

    if (time < availability.startTime || time > availability.endTime) {
      return NextResponse.json(
        { success: false, message: "Outside working hours" },
        { status: 400 }
      );
    }

    // 🔥 Prevent duplicate booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        businessId,
        date,
        time,
        status: { not: "Cancelled" },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, message: "Slot already booked" },
        { status: 400 }
      );
    }

    // 🔍 Get intake form
    const intakeForm = await prisma.intakeForm.findFirst({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });

    const booking = await prisma.booking.create({
      data: {
        date,
        time,
        email,
        businessId,
        status: "Scheduled",
        intakeFormId: intakeForm?.id || null,
        intakeSent: false,
      },
    });

    // 📩 Confirmation Email
    try {
      await sendEmail(
        email,
        "Booking Confirmed",
        `Your booking is scheduled on ${date} at ${time}`
      );
    } catch (e) {
      console.error("Confirmation email failed:", e);
    }

    // 📩 Intake Form Email
    if (intakeForm) {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        const intakeLink = `${baseUrl}/intake/${intakeForm.id}?booking=${booking.id}`;

        await sendEmail(
          email,
          "Complete Your Intake Form",
          `Please complete your intake form before your visit:\n\n${intakeLink}`
        );

        await prisma.booking.update({
          where: { id: booking.id },
          data: { intakeSent: true },
        });

      } catch (e) {
        console.error("Intake email failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error("Booking POST error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return NextResponse.json([]);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return NextResponse.json([]);

    const bookings = await prisma.booking.findMany({
      where: { businessId: user.businessId },
      include: {
        intakeSubmission: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);

  } catch (error) {
    console.error("GET Booking error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
