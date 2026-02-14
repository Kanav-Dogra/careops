import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, message, businessId } = body;

    // 🔥 Basic validation
    if (!name || !email || !businessId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // 🔥 Ensure business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid business",
        },
        { status: 400 }
      );
    }

    // 🔥 Create lead
    const lead = await prisma.lead.create({
      data: {
        name: String(name),
        email: String(email),
        message: message ? String(message) : "",
        businessId: businessId,
        status: "New",
      },
    });

    return NextResponse.json({
      success: true,
      lead,
    });

  } catch (error) {
    console.error("Public Lead POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
