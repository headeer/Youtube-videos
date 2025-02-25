import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params?.id) {
    return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
  }

  try {
    const video = await prisma.videoIdea.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Error fetching video" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params?.id) {
    return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, description, plannedDate, script } = body;

    const video = await prisma.videoIdea.update({
      where: { id: params.id },
      data: {
        title,
        description,
        plannedDate: plannedDate ? new Date(plannedDate) : undefined,
        script,
      },
      include: {
        tasks: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Error updating video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params?.id) {
    return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
  }

  try {
    await prisma.videoIdea.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Error deleting video" },
      { status: 500 }
    );
  }
}
