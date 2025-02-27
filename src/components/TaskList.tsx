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

  return (
    <div className="space-y-4">
      {phaseOrder.map((phase) => {
        // Filter tasks for this phase
        const phaseTasks = localTasks.filter((task) => task.phase === phase);
        if (phaseTasks.length === 0) return null;

        return (
          <div key={phase} className="bg-white/5 rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-white/10">
              <h3 className="text-sm font-medium text-white">{phase}</h3>
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
