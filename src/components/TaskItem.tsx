import { useState, useEffect, useCallback } from "react";
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export default function TaskItem({ task, onTaskUpdated }: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [pendingUpdate, setPendingUpdate] = useState<boolean | null>(null);

  // Sync local state with prop when it changes
  useEffect(() => {
    setIsCompleted(task.isCompleted);
    setPendingUpdate(null);
  }, [task.isCompleted]);

  const updateTask = useCallback(
    async (
      newCompletedState: boolean,
      attempt = 0
    ): Promise<ClientTask | null> => {
      try {
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
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update task");
        }

        const updatedTask = await response.json();
        return updatedTask;
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return updateTask(newCompletedState, attempt + 1);
        }
        throw err;
      }
    },
    [task.id]
  );

  const handleToggleComplete = async () => {
    if (isLoading || pendingUpdate !== null) return;

    const newCompletedState = !isCompleted;
    setIsLoading(true);
    setError(null);
    setPendingUpdate(newCompletedState);

    try {
      // Optimistically update UI
      setIsCompleted(newCompletedState);

      const updatedTask = await updateTask(newCompletedState);

      if (updatedTask) {
        if (onTaskUpdated) {
          onTaskUpdated(updatedTask);
        }
        setPendingUpdate(null);
        setRetryCount(0);
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update task. Please try again."
      );

      // Revert optimistic update if all retries failed
      setIsCompleted(task.isCompleted);
      setPendingUpdate(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry failed updates when connection is restored
  useEffect(() => {
    if (pendingUpdate !== null && !isLoading && retryCount < MAX_RETRIES) {
      const retryUpdate = async () => {
        setRetryCount((prev) => prev + 1);
        try {
          const updatedTask = await updateTask(pendingUpdate);
          if (updatedTask) {
            if (onTaskUpdated) {
              onTaskUpdated(updatedTask);
            }
            setPendingUpdate(null);
            setRetryCount(0);
            setError(null);
          }
        } catch (err) {
          console.error("Retry failed:", err);
        }
      };

      const timeoutId = setTimeout(retryUpdate, RETRY_DELAY);
      return () => clearTimeout(timeoutId);
    }
  }, [pendingUpdate, isLoading, retryCount, updateTask, onTaskUpdated]);

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
            isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-2 border-gray-300 dark:border-gray-500 bg-transparent hover:border-green-500"
          } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${
            pendingUpdate !== null ? "opacity-50" : ""
          }`}
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          {isCompleted && (
            <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          )}
        </button>
        <span
          className={`text-sm ${
            isCompleted
              ? "line-through text-gray-500"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          {task.title}
          {pendingUpdate !== null && retryCount > 0 && (
            <span className="ml-2 text-xs text-yellow-500">
              Retrying... ({retryCount}/{MAX_RETRIES})
            </span>
          )}
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
