import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Excuse ID is required" },
        { status: 400 }
      );
    }

    // First check if the excuse exists
    const excuse = await prisma.excuse.findUnique({
      where: { id },
      include: { uses: true },
    });

    if (!excuse) {
      return NextResponse.json({ error: "Excuse not found" }, { status: 404 });
    }

    // Delete the excuse and all associated uses in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all associated uses first
      await tx.excuseUse.deleteMany({
        where: { excuseId: id },
      });

      // Then delete the excuse
      await tx.excuse.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting excuse:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Excuse not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete excuse" },
      { status: 500 }
    );
  }
}
