import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskPhase, VideoStatus } from "@prisma/client";

// Map task phases to video statuses
const PHASE_TO_STATUS: Record<TaskPhase, VideoStatus> = {
  IDEATION: "PLANNING",
  PLANNING: "PLANNING",
  SCRIPTING: "SCRIPTING",
  RECORDING: "RECORDING",
  EDITING: "EDITING",
  THUMBNAIL: "PACKAGING",
  METADATA: "PACKAGING",
  DISTRIBUTION: "DISTRIBUTION",
  OTHER: "PLANNING",
};

// Define the order of statuses for progression
const STATUS_ORDER: VideoStatus[] = [
  "PLANNING",
  "SCRIPTING",
  "RECORDING",
  "EDITING",
  "PACKAGING",
  "DISTRIBUTION",
  "COMPLETED",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Wait for params to be available
    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { isCompleted, notes } = body;

    // Prepare update data
    const updateData: { isCompleted?: boolean; notes?: string } = {};
    if (typeof isCompleted === "boolean") {
      updateData.isCompleted = isCompleted;
    }
    if (typeof notes === "string") {
      updateData.notes = notes;
    }

    // Update the task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        videoIdea: {
          include: {
            tasks: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    // Get all tasks for this video
    const allVideoTasks = await prisma.task.findMany({
      where: { videoIdeaId: task.videoIdeaId },
    });

    // Calculate the appropriate status based on completed tasks
    let newStatus: VideoStatus = "PLANNING";

    // Go through statuses in order and check if we can progress
    for (const status of STATUS_ORDER) {
      // Find all tasks that belong to phases mapping to this status
      const tasksForStatus = allVideoTasks.filter(
        (t) => PHASE_TO_STATUS[t.phase as TaskPhase] === status
      );

      // If there are no tasks for this status, continue to next
      if (tasksForStatus.length === 0) continue;

      // If all tasks for this status are completed, we can move to next status
      const allCompleted = tasksForStatus.every((t) => t.isCompleted);

      if (!allCompleted) {
        // If not all tasks are completed, this is our status
        newStatus = status;
        break;
      }

      // If this is the last status and all tasks are completed
      if (status === STATUS_ORDER[STATUS_ORDER.length - 1]) {
        newStatus = "COMPLETED";
      } else {
        // Otherwise, keep going to next status
        newStatus = status;
      }
    }

    // Update the video status
    await prisma.videoIdea.update({
      where: { id: task.videoIdeaId },
      data: { status: newStatus },
    });

    // Return the updated task with the new video status
    return NextResponse.json({
      ...task,
      videoIdea: {
        ...task.videoIdea,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Error updating task" }, { status: 500 });
  }
}
