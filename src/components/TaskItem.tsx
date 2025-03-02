import { useState } from "react";
import { TaskPhase } from "@prisma/client";
import { CheckIcon } from "@heroicons/react/24/outline";
import { ClientTask } from "@/types";

interface TaskItemProps {
  task: ClientTask;
  onTaskUpdated?: (updatedTask: ClientTask) => void;
}

export default function TaskItem({ task, onTaskUpdated }: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
    } catch (err) {
      console.error("Error updating task:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center space-x-3">
        <button
          onClick={handleToggleComplete}
          disabled={isLoading}
          className={`flex-shrink-0 h-6 w-6 rounded ${
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-2 border-gray-300 dark:border-gray-500 bg-transparent hover:border-green-500"
          } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
          aria-label={
            task.completed ? "Mark as incomplete" : "Mark as complete"
          }
        >
          {task.completed && (
            <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
          )}
          {isLoading && (
            <div className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
          )}
        </button>
        <span
          className={`text-sm ${
            task.completed
              ? "line-through text-gray-500"
              : "text-gray-700 dark:text-gray-200"
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
    </div>
  );
}
