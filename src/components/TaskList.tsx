import { useState, useEffect, useCallback } from "react";
import { TaskPhase } from "@prisma/client";
import TaskItem from "./TaskItem";
import { ClientTask } from "@/types";
import HelpModal from "./HelpModal";
import { HELP_CONTENT } from "@/utils/helpContent";
import { TasksSkeleton } from "./Skeleton";

interface TaskListProps {
  tasks: ClientTask[];
  onTasksUpdated?: (tasks: ClientTask[]) => void;
  isLoading?: boolean;
}

export default function TaskList({
  tasks,
  onTasksUpdated,
  isLoading,
}: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<ClientTask[]>(tasks);

  // Update local tasks when props change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleTaskUpdated = useCallback(
    (updatedTask: ClientTask) => {
      const newTasks = localTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      setLocalTasks(newTasks);

      if (onTasksUpdated) {
        onTasksUpdated(newTasks);
      }
    },
    [localTasks, onTasksUpdated]
  );

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
    const completed = tasks.filter((task) => task.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const getPhaseHelp = (
    phase: TaskPhase
  ): { title: string; content: string } | null => {
    switch (phase) {
      case "PLANNING":
        return {
          title: "Initial Video Idea Guidelines",
          content: HELP_CONTENT.INITIAL_VIDEO_IDEA,
        };
      case "RECORDING":
        return {
          title: "Recording Best Practices",
          content: HELP_CONTENT.RECORDING,
        };
      case "EDITING":
        return {
          title: "Editing Guidelines",
          content: HELP_CONTENT.EDITING,
        };
      case "THUMBNAIL":
      case "METADATA":
      case "DISTRIBUTION":
        return null;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <TasksSkeleton />;
  }

  return (
    <div className="space-y-4">
      {phaseOrder.map((phase) => {
        const phaseTasks = localTasks.filter((task) => task.phase === phase);
        if (phaseTasks.length === 0) return null;

        const { total, completed, percentage } = getCompletionStats(phaseTasks);
        const helpContent = getPhaseHelp(phase);

        return (
          <div key={phase} className="bg-white/5 rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-white">{phase}</h3>
                  {helpContent && (
                    <div className="relative z-10">
                      <HelpModal
                        title={helpContent.title}
                        content={helpContent.content}
                      />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-300">
                  <span className="font-medium">
                    {completed}/{total}
                  </span>{" "}
                  tasks completed
                  <span className="ml-2 text-xs">({percentage}%)</span>
                </div>
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
