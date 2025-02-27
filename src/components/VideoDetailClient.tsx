"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { format, parseISO } from "date-fns";
import { VideoStatus, TaskPhase } from "@prisma/client";
import { getStatusColorClasses, getStatusIcon } from "@/utils/statusColors";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TaskList from "./TaskList";

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

interface VideoMetadata {
  tags: string[];
  category: string;
}

interface VideoIdea {
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

interface VideoDetailClientProps {
  video: VideoIdea;
}

export default function VideoDetailClient({ video }: VideoDetailClientProps) {
  const router = useRouter();
  const [currentVideo, setCurrentVideo] = useState<VideoIdea>(video);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || "");
  const [script, setScript] = useState(video.script || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          script,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update video");
      }

      const updatedVideo = await response.json();
      setCurrentVideo(updatedVideo);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating video:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete video");
      }

      router.push("/");
    } catch (err) {
      console.error("Error deleting video:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const handleTasksUpdated = (updatedTasks: ClientTask[]) => {
    setCurrentVideo({
      ...currentVideo,
      tasks: updatedTasks,
    });
  };

  const tasksByPhase = currentVideo.tasks.reduce((acc, task) => {
    if (!acc[task.phase]) {
      acc[task.phase] = [];
    }
    acc[task.phase].push(task);
    return acc;
  }, {} as Record<string, ClientTask[]>);

  return (
    <div className="min-h-screen bg-[#111e19]">
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                  {currentVideo.title}
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <div className="rounded-xl bg-[#1a2b24] p-6 shadow">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Script
                        </label>
                        <textarea
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          rows={8}
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2.5 font-mono"
                          placeholder="Write your video script here..."
                        />
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <dl className="space-y-6">
                      <div className="flex items-center justify-between">
                        <dt className="font-medium text-gray-200">Status</dt>
                        <dd>
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium ${getStatusColorClasses(
                                currentVideo.status
                              )}`}
                            >
                              {(() => {
                                const Icon = getStatusIcon(currentVideo.status);
                                return <Icon className="h-5 w-5" />;
                              })()}
                              {currentVideo.status}
                            </span>
                          </div>
                        </dd>
                      </div>

                      <div>
                        <dt className="font-medium text-gray-200">
                          Planned Date
                        </dt>
                        <dd className="mt-1 text-white">
                          {format(
                            typeof currentVideo.plannedDate === "string"
                              ? parseISO(currentVideo.plannedDate)
                              : currentVideo.plannedDate,
                            "MMM d, yyyy"
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-medium text-gray-200">
                          Description
                        </dt>
                        <dd className="mt-1 text-white whitespace-pre-wrap">
                          {currentVideo.description || "No description"}
                        </dd>
                      </div>
                      {currentVideo.script && (
                        <div>
                          <dt className="font-medium text-gray-200">Script</dt>
                          <dd className="mt-1 text-white whitespace-pre-wrap font-mono">
                            {currentVideo.script}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-xl bg-[#1a2b24] p-6 shadow">
                  <h2 className="text-lg font-medium text-white mb-4">
                    Thumbnail
                  </h2>
                  {currentVideo.thumbnailUrl ? (
                    <div className="relative w-full h-48 mb-4">
                      <Image
                        src={currentVideo.thumbnailUrl}
                        alt={`Thumbnail for ${currentVideo.title}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-white/5 rounded-lg mb-4">
                      <p className="text-gray-400 text-sm">No thumbnail</p>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-[#1a2b24] p-6 shadow">
                  <h2 className="text-lg font-medium text-white mb-4">Tasks</h2>
                  <div className="space-y-6">
                    {Object.entries(tasksByPhase).map(([phase, tasks]) => (
                      <div key={phase}>
                        <h3 className="text-sm font-medium text-gray-200 mb-3">
                          {phase.charAt(0) + phase.slice(1).toLowerCase()}
                        </h3>
                        <TaskList
                          tasks={tasks}
                          videoId={currentVideo.id}
                          onTasksUpdated={handleTasksUpdated}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
