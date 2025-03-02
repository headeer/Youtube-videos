import { useState, useEffect } from "react";
import { TaskPhase } from "@prisma/client";
import TaskItem from "./TaskItem";

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

interface TaskListProps {
  tasks: ClientTask[];
  onTasksUpdated?: (tasks: ClientTask[]) => void;
}

export default function TaskList({ tasks, onTasksUpdated }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<ClientTask[]>(tasks);

  // Update local tasks when props change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleTaskUpdated = (updatedTask: ClientTask) => {
    // Prevent state update if task is not found
    if (!localTasks.some((task) => task.id === updatedTask.id)) return;

    const newTasks = localTasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );

    setLocalTasks(newTasks);

    if (onTasksUpdated) {
      onTasksUpdated(newTasks);
    }
  };

  // Sort phases in the correct order
  const phaseOrder: TaskPhase[] = [
    "PLANNING",
    "RECORDING",
    "EDITING",
    "THUMBNAIL",
    "METADATA",
    "DISTRIBUTION",
  ];

  // Calculate completion stats
  const getCompletionStats = (tasks: ClientTask[]) => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  return (
    <div className="space-y-4">
      {phaseOrder.map((phase) => {
        // Filter tasks for this phase
        const phaseTasks = localTasks.filter((task) => task.phase === phase);
        if (phaseTasks.length === 0) return null;

        const { total, completed, percentage } = getCompletionStats(phaseTasks);

        return (
          <div key={phase} className="bg-white/5 rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-sm font-medium text-white">{phase}</h3>
              <div className="text-xs text-gray-300">
                <span className="font-medium">
                  {completed}/{total}
                </span>{" "}
                tasks completed
                <span className="ml-2 text-xs">({percentage}%)</span>
              </div>
            </div>
            <div className="divide-y divide-white/10">
              {phaseTasks
                .sort((a, b) => a.order - b.order)
                .map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onTaskUpdated={handleTaskUpdated}
                  />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
