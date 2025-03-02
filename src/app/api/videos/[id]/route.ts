import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VideoStatus, TaskPhase } from "@prisma/client";

// Simplified status determination based on phase completion
const determineVideoStatus = (
  tasks: { phase: TaskPhase; completed: boolean }[]
) => {
  const tasksByPhase = tasks.reduce((acc, task) => {
    acc[task.phase] = acc[task.phase] || { total: 0, completed: 0 };
    acc[task.phase].total++;
    if (task.completed) acc[task.phase].completed++;
    return acc;
  }, {} as Record<TaskPhase, { total: number; completed: number }>);

  if (
    tasksByPhase.DISTRIBUTION?.completed === tasksByPhase.DISTRIBUTION?.total
  ) {
    return VideoStatus.PUBLISHED;
  }
  if (tasksByPhase.EDITING?.completed === tasksByPhase.EDITING?.total) {
    return VideoStatus.EDITING;
  }
  if (tasksByPhase.RECORDING?.completed === tasksByPhase.RECORDING?.total) {
    return VideoStatus.RECORDING;
  }
  return VideoStatus.PLANNING;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const video = await prisma.videoIdea.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { order: "asc" },
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
  try {
    const { id } = params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const body = await request.json();
    const { tasks, updateStatus, ...updateData } = body;

    const currentVideo = await prisma.videoIdea.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!currentVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // If tasks are provided, update them in bulk
    if (tasks) {
      await prisma.$transaction(
        tasks.map((task: { id: string; completed: boolean }) =>
          prisma.task.update({
            where: { id: task.id },
            data: { completed: task.completed },
          })
        )
      );
    }

    // Update video status if needed
    const status = updateStatus
      ? determineVideoStatus(currentVideo.tasks)
      : undefined;

    const video = await prisma.videoIdea.update({
      where: { id },
      data: {
        ...updateData,
        ...(status && { status }),
      },
      include: {
        tasks: {
          orderBy: { order: "asc" },
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
  try {
    const { id } = params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
    }

    await prisma.videoIdea.delete({
      where: { id },
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
