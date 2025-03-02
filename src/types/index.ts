import { TaskPhase, VideoStatus } from "@prisma/client";

export interface ClientTask {
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

export interface VideoIdea {
  id: string;
  title: string;
  description?: string | null;
  script?: string | null;
  metadata?: Record<string, unknown>;
  thumbnailUrl?: string | null;
  plannedDate: Date;
  status: VideoStatus;
  isUploaded: boolean;
  createdAt: Date;
  updatedAt: Date;
  tasks: ClientTask[];
}
