import { useState } from "react";
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
  videoId: string;
  onTasksUpdated?: (tasks: ClientTask[]) => void;
}

export default function TaskList({
  tasks,
  videoId,
  onTasksUpdated,
}: TaskListProps) {
  const [localTasks, setLocalTasks] = useState<ClientTask[]>(tasks);

  const handleTaskUpdated = (updatedTask: ClientTask) => {
    const newTasks = localTasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );

    setLocalTasks(newTasks);

    if (onTasksUpdated) {
      onTasksUpdated(newTasks);
    }
  };

  // Group tasks by phase
  const tasksByPhase = localTasks.reduce((acc, task) => {
    if (!acc[task.phase]) {
      acc[task.phase] = [];
    }
    acc[task.phase].push(task);
    return acc;
  }, {} as Record<string, ClientTask[]>);

  // Sort phases in the correct order
  const phaseOrder: TaskPhase[] = [
    "PLANNING",
    "RECORDING",
    "EDITING",
    "THUMBNAIL",
    "METADATA",
    "DISTRIBUTION",
  ];

  return (
    <div className="space-y-6">
      {phaseOrder.map((phase) => {
        const phaseTasks = tasksByPhase[phase] || [];
        if (phaseTasks.length === 0) return null;

        return (
          <div
            key={phase}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">{phase}</h3>
            </div>
            <div className="divide-y divide-gray-200">
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
