import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VideoStatus, TaskPhase } from "@prisma/client";

export async function GET() {
  try {
    const videos = await prisma.videoIdea.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        plannedDate: true,
        isUploaded: true,
      },
      orderBy: {
        plannedDate: "asc",
      },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch videos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, plannedDate, script } = body;

    if (!title || !plannedDate) {
      return NextResponse.json(
        { error: "Title and planned date are required" },
        { status: 400 }
      );
    }

    const video = await prisma.videoIdea.create({
      data: {
        title,
        description: description || null,
        script: script || null,
        // Skip metadata for now to avoid type issues
        plannedDate: new Date(plannedDate),
        status: VideoStatus.PLANNING,
        isUploaded: false,
        tasks: {
          create: [
            { title: "Research Topic", phase: TaskPhase.PLANNING, order: 0 },
            { title: "Create Outline", phase: TaskPhase.PLANNING, order: 1 },
            { title: "Write Script", phase: TaskPhase.PLANNING, order: 2 },
            { title: "Record Video", phase: TaskPhase.RECORDING, order: 3 },
            { title: "Edit Video", phase: TaskPhase.EDITING, order: 4 },
            { title: "Create Thumbnail", phase: TaskPhase.THUMBNAIL, order: 5 },
            {
              title: "Add Description & Tags",
              phase: TaskPhase.METADATA,
              order: 6,
            },
            {
              title: "Schedule Upload",
              phase: TaskPhase.DISTRIBUTION,
              order: 7,
            },
          ],
        },
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
    console.error("Error creating video:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create video", details: errorMessage },
      { status: 500 }
    );
  }
}
