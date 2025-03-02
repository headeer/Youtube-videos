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
  const [optimisticCompleted, setOptimisticCompleted] = useState(
    task.completed
  );

  const handleToggleComplete = async () => {
    if (isLoading) return;

    // Optimistic update
    const newCompletedState = !optimisticCompleted;
    setOptimisticCompleted(newCompletedState);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: newCompletedState,
        }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setOptimisticCompleted(!newCompletedState);
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
        return "bg-blue-500/10 text-blue-500";
      case "RECORDING":
        return "bg-purple-500/10 text-purple-500";
      case "EDITING":
        return "bg-orange-500/10 text-orange-500";
      case "THUMBNAIL":
        return "bg-pink-500/10 text-pink-500";
      case "METADATA":
        return "bg-green-500/10 text-green-500";
      case "DISTRIBUTION":
        return "bg-indigo-500/10 text-indigo-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center space-x-3">
        <button
          onClick={handleToggleComplete}
          disabled={isLoading}
          className={`flex-shrink-0 h-6 w-6 rounded ${
            optimisticCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-2 border-gray-300 dark:border-gray-500 bg-transparent hover:border-green-500"
          } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
          aria-label={
            optimisticCompleted ? "Mark as incomplete" : "Mark as complete"
          }
        >
          {optimisticCompleted && (
            <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
          )}
          {isLoading && (
            <div className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
          )}
        </button>
        <span
          className={`text-sm ${
            optimisticCompleted
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
