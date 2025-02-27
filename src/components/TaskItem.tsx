import { useState } from "react";
import { TaskPhase } from "@prisma/client";
import { CheckIcon, XCircleIcon } from "@heroicons/react/24/outline";

// Define the client-side task interface
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

interface TaskItemProps {
  task: ClientTask;
  onTaskUpdated?: (updatedTask: ClientTask) => void;
}

export default function TaskItem({ task, onTaskUpdated }: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Local state to immediately reflect changes
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);

  const getPhaseColor = (phase: TaskPhase) => {
    switch (phase) {
      case "PLANNING":
        return "bg-blue-100 text-blue-800";
      case "RECORDING":
        return "bg-purple-100 text-purple-800";
      case "EDITING":
        return "bg-orange-100 text-orange-800";
      case "THUMBNAIL":
        return "bg-pink-100 text-pink-800";
      case "METADATA":
        return "bg-green-100 text-green-800";
      case "DISTRIBUTION":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleToggleComplete = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Update local state immediately for better UX
      const newCompletedState = !isCompleted;
      setIsCompleted(newCompletedState);

      console.log(
        `Updating task ${task.id}, setting isCompleted to ${newCompletedState}`
      );

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted: newCompletedState,
        }),
      });

      if (!response.ok) {
        // Revert local state if API call fails
        setIsCompleted(!newCompletedState);
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      const updatedTask = await response.json();
      console.log("Task updated successfully:", updatedTask);

      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center space-x-3">
        <button
          onClick={handleToggleComplete}
          disabled={isLoading}
          className={`flex-shrink-0 h-6 w-6 rounded border ${
            isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 bg-white hover:border-green-500"
          } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          {isCompleted && (
            <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
          )}
        </button>
        <span
          className={`text-sm ${
            isCompleted ? "line-through text-gray-500" : "text-gray-700"
          }`}
        >
          {task.title}
        </span>
      </div>
      <div className="flex items-center">
        <span
          className={`text-xs px-2 py-1 rounded-full ${getPhaseColor(
            task.phase
          )}`}
        >
          {task.phase}
        </span>
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-xs flex items-center">
          <XCircleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}
