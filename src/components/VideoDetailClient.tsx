"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { VideoStatus } from "./HomeClient";
import { getStatusColorClasses, getStatusIcon } from "@/utils/statusColors";

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  phase: string;
  order: number;
  notes?: string;
}

interface VideoMetadata {
  tags: string[];
  category: string;
}

interface VideoIdea {
  id: string;
  title: string;
  description: string | null;
  script: string | null;
  metadata: VideoMetadata | null;
  thumbnailUrl: string | null;
  status: VideoStatus;
  isUploaded: boolean;
  plannedDate: Date;
  finishDate: Date | null;
  tasks: Task[];
}

export default function VideoDetailClient({
  video: initialVideo,
}: {
  video: VideoIdea;
}) {
  const [video, setVideo] = useState(initialVideo);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: video.title,
    description: video.description || "",
    script: video.script || "",
    metadata: video.metadata || { tags: [], category: "" },
    plannedDate: format(video.plannedDate, "yyyy-MM-dd"),
  });

  const handleTaskToggle = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted: !video.tasks.find((t) => t.id === taskId)?.isCompleted,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setVideo((prev) => ({
          ...prev,
          tasks: updatedTask.videoIdea.tasks,
        }));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskNoteUpdate = async (taskId: string, notes: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setVideo((prev) => ({
          ...prev,
          tasks: updatedTask.videoIdea.tasks,
        }));
      }
    } catch (error) {
      console.error("Error updating task notes:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedVideo = await response.json();
        setVideo(updatedVideo);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating video:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video idea?")) {
      return;
    }

    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("thumbnail", file);

    try {
      const response = await fetch(`/api/videos/${video.id}/thumbnail`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { thumbnailUrl } = await response.json();
        setVideo((prev) => ({ ...prev, thumbnailUrl }));
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    }
  };

  const tasksByPhase = video.tasks.reduce((acc, task) => {
    if (!acc[task.phase]) {
      acc[task.phase] = [];
    }
    acc[task.phase].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 rounded-full p-2 hover:bg-white/10 text-white"
                aria-label="Back to videos"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                {video.title}
              </h1>
            </div>
            <div>
              {isEditing ? (
                <div className="space-x-4">
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
              ) : (
                <div className="space-x-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                  >
                    Edit Video
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Delete Video
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            {/* Video Details */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6">
                  <h2 className="text-xl font-semibold leading-7 text-white">
                    Details
                  </h2>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) =>
                            setEditData({ ...editData, title: e.target.value })
                          }
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Description
                        </label>
                        <textarea
                          value={editData.description}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              description: e.target.value,
                            })
                          }
                          rows={4}
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Planned Date
                        </label>
                        <input
                          type="date"
                          value={editData.plannedDate}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              plannedDate: e.target.value,
                            })
                          }
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Script
                        </label>
                        <textarea
                          value={editData.script}
                          onChange={(e) =>
                            setEditData({ ...editData, script: e.target.value })
                          }
                          rows={8}
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2.5 font-mono"
                          placeholder="Write your video script here..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Thumbnail
                        </label>
                        <div className="flex items-center gap-4">
                          {video.thumbnailUrl && (
                            <img
                              src={video.thumbnailUrl}
                              alt="Video thumbnail"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleThumbnailUpload(file);
                            }}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#40f99b] file:text-[#111e19] hover:file:bg-[#40f99b]/90"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={handleSave}
                          className="rounded-md bg-[#40f99b] px-4 py-2.5 text-sm font-medium text-[#111e19] hover:bg-[#40f99b]/90 focus:outline-none focus:ring-2 focus:ring-[#40f99b] focus:ring-offset-2 focus:ring-offset-[#111e19]"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <dl className="mt-6 space-y-6 text-sm">
                      <div>
                        <dt className="font-medium text-gray-200">
                          Current Status
                        </dt>
                        <dd className="mt-1">
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium ${getStatusColorClasses(
                                video.status
                              )}`}
                            >
                              {(() => {
                                const Icon = getStatusIcon(video.status);
                                return <Icon className="h-5 w-5" />;
                              })()}
                              {video.status}
                            </span>
                          </div>
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-200">
                          Planned Date
                        </dt>
                        <dd className="mt-1 text-white">
                          {format(new Date(video.plannedDate), "MMM d, yyyy")}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-200">
                          Description
                        </dt>
                        <dd className="mt-1 text-white whitespace-pre-wrap">
                          {video.description || "No description"}
                        </dd>
                      </div>
                      {video.script && (
                        <div>
                          <dt className="font-medium text-gray-200">Script</dt>
                          <dd className="mt-1 text-white whitespace-pre-wrap font-mono">
                            {video.script}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6">
                  <h2 className="text-xl font-semibold leading-7 text-white mb-4">
                    Thumbnail
                  </h2>
                  {video.thumbnailUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.thumbnailUrl}
                        alt="Video thumbnail"
                        className="object-cover"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <label className="cursor-pointer">
                            <span className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600">
                              Change Thumbnail
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleThumbnailUpload(file);
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-video rounded-lg border-2 border-dashed border-white/20">
                      <label className="cursor-pointer">
                        <span className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600">
                          Upload Thumbnail
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbnailUpload(file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6">
                <h2 className="text-xl font-semibold leading-7 text-white mb-6">
                  Production Tasks
                </h2>
                <div className="space-y-8">
                  {Object.entries(tasksByPhase).map(([phase, tasks]) => (
                    <div key={phase} className="space-y-4">
                      <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">
                        {phase.charAt(0) + phase.slice(1).toLowerCase()}
                      </h3>
                      <ul className="space-y-3">
                        {tasks
                          .sort((a, b) => a.order - b.order)
                          .map((task) => (
                            <li key={task.id} className="group space-y-2">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleTaskToggle(task.id)}
                                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                                    task.isCompleted
                                      ? "bg-indigo-500 border-transparent"
                                      : "border-white/20 hover:border-white/40"
                                  }`}
                                >
                                  {task.isCompleted && (
                                    <CheckIcon className="h-3.5 w-3.5 text-white" />
                                  )}
                                </button>
                                <span
                                  className={`text-sm ${
                                    task.isCompleted
                                      ? "text-gray-400 line-through"
                                      : "text-white group-hover:text-white"
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>
                              {isEditing && (
                                <div className="ml-8">
                                  <textarea
                                    placeholder="Add notes..."
                                    value={task.notes || ""}
                                    onChange={(e) =>
                                      handleTaskNoteUpdate(
                                        task.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full text-sm rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                    rows={2}
                                  />
                                </div>
                              )}
                              {!isEditing && task.notes && (
                                <div className="ml-8 text-sm text-gray-400">
                                  {task.notes}
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
