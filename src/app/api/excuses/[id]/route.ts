import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const excuse = await prisma.excuse.findUnique({
      where: { id: params.id },
      include: {
        uses: {
          include: {
            videoIdea: true,
          },
        },
      },
    });

    if (!excuse) {
      return NextResponse.json({ error: "Excuse not found" }, { status: 404 });
    }

    return NextResponse.json(excuse);
  } catch (error) {
    console.error("Error fetching excuse:", error);
    return NextResponse.json(
      { error: "Failed to fetch excuse" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Excuse text is required" },
        { status: 400 }
      );
    }

    const excuse = await prisma.excuse.update({
      where: { id: params.id },
      data: { text },
      include: {
        uses: {
          include: {
            videoIdea: true,
          },
        },
      },
    });

    return NextResponse.json(excuse);
  } catch (error) {
    console.error("Error updating excuse:", error);
    return NextResponse.json(
      { error: "Failed to update excuse" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await prisma.excuse.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting excuse:", error);
    return NextResponse.json(
      { error: "Failed to delete excuse" },
      { status: 500 }
    );
  }
}
