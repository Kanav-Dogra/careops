import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * PUBLIC FORM FETCH
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Form ID missing" },
        { status: 400 }
      );
    }

    const form = await prisma.intakeForm.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(form);

  } catch (error) {
    console.error("Intake GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch form" },
      { status: 500 }
    );
  }
}
