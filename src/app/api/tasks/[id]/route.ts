import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VideoStatus, TaskPhase } from "@prisma/client";

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
  if (!params.id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { completed } = body;

    // First update the task
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { completed },
      include: { video: { include: { tasks: true } } },
    });

    // Then update the video status
    await prisma.videoIdea.update({
      where: { id: updatedTask.videoId },
      data: { status: determineVideoStatus(updatedTask.video.tasks) },
    });

    return NextResponse.json(updatedTask);
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
