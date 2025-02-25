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
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Error fetching videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, plannedDate } = body;

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
        plannedDate: new Date(plannedDate),
        status: VideoStatus.PLANNING,
        isUploaded: false,
        tasks: {
          create: [
            { title: "Research topic", phase: TaskPhase.IDEATION, order: 0 },
            {
              title: "Outline video structure",
              phase: TaskPhase.PLANNING,
              order: 1,
            },
            {
              title: "Write script draft",
              phase: TaskPhase.SCRIPTING,
              order: 2,
            },
            { title: "Record footage", phase: TaskPhase.RECORDING, order: 3 },
            { title: "Edit video", phase: TaskPhase.EDITING, order: 4 },
            { title: "Create thumbnail", phase: TaskPhase.THUMBNAIL, order: 5 },
            { title: "Add metadata", phase: TaskPhase.METADATA, order: 6 },
            {
              title: "Upload and schedule",
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
    return NextResponse.json(
      { error: "Error creating video" },
      { status: 500 }
    );
  }
}
