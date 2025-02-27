import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskPhase } from "@prisma/client";

// Define an interface for the task data in the database
interface TaskData {
  id: string;
  title: string;
  completed: boolean;
  phase: TaskPhase;
  order: number;
  notes?: string | null;
  videoId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define an interface for the client-side task representation
interface ClientTask {
  id: string;
  title: string;
  isCompleted: boolean;
  phase: TaskPhase;
  order: number;
  notes?: string | null;
  videoIdeaId: string;
  createdAt: Date;
  updatedAt: Date;
}

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
    const id = params.id;
    const body = await request.json();

    console.log("Updating task:", id, "with data:", body);

    // Map isCompleted to completed if it exists in the request
    const updateData: Partial<TaskData> = {};

    // Copy allowed fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.phase !== undefined) updateData.phase = body.phase;
    if (body.order !== undefined) updateData.order = body.order;

    // Handle the isCompleted to completed mapping
    if (body.isCompleted !== undefined) {
      updateData.completed = Boolean(body.isCompleted);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Map completed back to isCompleted for the response
    const clientTask: ClientTask = {
      ...updatedTask,
      isCompleted: updatedTask.completed,
      videoIdeaId: updatedTask.videoId,
    };

    console.log("Task updated successfully:", clientTask);
    return NextResponse.json(clientTask);
  } catch (error) {
    console.error("Error updating task:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update task", details: errorMessage },
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
