import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";

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

export async function POST() {
  try {
    const businessId = await getBusinessFromSession();
    if (!businessId) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const rules = await prisma.automationRule.findMany({
      where: {
        businessId,
        active: true,
      },
    });

    // 🔥 1. NEW LEAD WELCOME
    if (rules.find(r => r.trigger === "New Lead")) {
      const leads = await prisma.lead.findMany({
        where: {
          businessId,
          welcomeSent: false,
        },
      });

      for (const lead of leads) {
        await sendEmail(
          lead.email,
          "Welcome!",
          "Thanks for contacting us. We will reach out soon."
        );

        await prisma.lead.update({
          where: { id: lead.id },
          data: { welcomeSent: true },
        });
      }
    }

    // 🔥 2. BOOKING REMINDER
    if (rules.find(r => r.trigger === "1 Day Before Booking")) {
      const bookings = await prisma.booking.findMany({
        where: {
          businessId,
          reminderSent: false,
        },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      for (const booking of bookings) {
        const bookingDate = new Date(booking.date);

        if (
          bookingDate.toDateString() === tomorrow.toDateString()
        ) {
          await sendEmail(
            booking.email,
            "Appointment Reminder",
            `Reminder: You have an appointment tomorrow at ${booking.time}`
          );

          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true },
          });
        }
      }
    }

    // 🔥 3. INVENTORY ALERT
    if (rules.find(r => r.trigger === "Inventory Below Threshold")) {
      const items = await prisma.inventory.findMany({
        where: { businessId },
      });

      for (const item of items) {
        if (item.quantity <= item.threshold) {
          await sendEmail(
            item.vendorEmail,
            "Inventory Alert",
            `Item ${item.name} is low. Quantity: ${item.quantity}`
          );
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Automation run error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
