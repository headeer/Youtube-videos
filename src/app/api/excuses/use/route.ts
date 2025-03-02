import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { excuseId, videoId } = body;

    if (!excuseId || !videoId) {
      return NextResponse.json(
        { error: "Excuse ID and Video ID are required" },
        { status: 400 }
      );
    }

    // First verify that both the excuse and video exist
    const [excuse, video] = await Promise.all([
      prisma.excuse.findUnique({ where: { id: excuseId } }),
      prisma.videoIdea.findUnique({ where: { id: videoId } }),
    ]);

    if (!excuse || !video) {
      return NextResponse.json(
        { error: "Invalid excuse or video ID" },
        { status: 404 }
      );
    }

    // Check if this excuse has already been used for this video
    const existingUse = await prisma.excuseUse.findFirst({
      where: {
        excuseId,
        videoIdeaId: videoId,
      },
    });

    if (existingUse) {
      return NextResponse.json(
        { error: "This excuse has already been used for this video" },
        { status: 400 }
      );
    }

    // Create the excuse use record within a transaction
    const updatedExcuse = await prisma.$transaction(async (tx) => {
      await tx.excuseUse.create({
        data: {
          excuseId,
          videoIdeaId: videoId,
        },
      });

      return tx.excuse.findUnique({
        where: { id: excuseId },
        include: {
          uses: {
            include: {
              videoIdea: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
    });

    if (!updatedExcuse) {
      throw new Error("Failed to update excuse");
    }

    return NextResponse.json(updatedExcuse);
  } catch (error) {
    console.error("Error using excuse:", error);
    return NextResponse.json(
      { error: "Failed to use excuse" },
      { status: 500 }
    );
  }
}
