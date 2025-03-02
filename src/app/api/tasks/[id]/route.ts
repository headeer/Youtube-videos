import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VideoStatus, TaskPhase } from "@prisma/client";

const determineVideoStatus = (
  tasks: { phase: TaskPhase; completed: boolean }[]
) => {
  const phaseCompletion = {
    DISTRIBUTION: tasks.every((t) => t.phase !== "DISTRIBUTION" || t.completed),
    EDITING: tasks.every((t) => t.phase !== "EDITING" || t.completed),
    RECORDING: tasks.every((t) => t.phase !== "RECORDING" || t.completed),
  };

  if (phaseCompletion.DISTRIBUTION) return VideoStatus.PUBLISHED;
  if (phaseCompletion.EDITING) return VideoStatus.EDITING;
  if (phaseCompletion.RECORDING) return VideoStatus.RECORDING;
  return VideoStatus.PLANNING;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Convert database task to client task
    const clientTask: ClientTask = {
      ...task,
      isCompleted: task.completed,
      videoIdeaId: task.videoId,
    };

    return NextResponse.json(clientTask);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { completed } = body;

    // Use a single transaction for both updates
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id },
        data: { completed },
        include: {
          video: {
            include: {
              tasks: true,
            },
          },
        },
      });

      // Update video status in the same transaction
      const updatedVideo = await tx.videoIdea.update({
        where: { id: task.videoId },
        data: {
          status: determineVideoStatus(
            task.video.tasks.map((t) => ({
              phase: t.phase,
              completed: t.id === id ? completed : t.completed,
            }))
          ),
        },
      });

      return { ...task, video: { ...task.video, status: updatedVideo.status } };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
