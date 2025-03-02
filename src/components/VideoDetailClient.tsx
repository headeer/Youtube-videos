"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TaskList from "./TaskList";
import { ClientTask, VideoIdea } from "@/types";
import { getStatusColorClasses, getStatusIcon } from "@/utils/statusColors";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleTasksUpdated = useCallback(
    async (updatedTasks: ClientTask[]) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/videos/${video.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tasks: updatedTasks.map((task) => ({
              id: task.id,
              completed: task.completed,
            })),
            updateStatus: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update video status");
        }

        const updatedVideo = await response.json();
        setCurrentVideo(updatedVideo);
      } catch (err) {
        console.error("Error updating video status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update status"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [video.id]
  );

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
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
        throw new Error("Failed to update video");
      }

      const updatedVideo = await response.json();
      setCurrentVideo(updatedVideo);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update video");
    } finally {
      setIsLoading(false);
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

    setIsLoading(true);
    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete video");
      setIsLoading(false);
    }
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsLoading(true);
    setError(null);

    try {
      // Upload the image
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload thumbnail");
      }

      const { url } = await uploadResponse.json();

      // Update the video with the new thumbnail URL
      const updateResponse = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thumbnailUrl: url,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update video thumbnail");
      }

      const updatedVideo = await updateResponse.json();
      setCurrentVideo(updatedVideo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update thumbnail"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveThumbnail = async () => {
    if (!confirm("Are you sure you want to remove the thumbnail?")) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thumbnailUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove thumbnail");
      }

      const updatedVideo = await response.json();
      setCurrentVideo(updatedVideo);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove thumbnail"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch(`/api/videos/${video.id}`);
        if (response.ok) {
          const updatedVideo = await response.json();
          setCurrentVideo(updatedVideo);
        }
      } catch (err) {
        console.error("Error loading initial video data:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [video.id]);

  // Add a separate useEffect for auto-refresh
  useEffect(() => {
    if (isInitialLoading) return; // Don't start interval until initial load is complete

    const loadVideoData = async () => {
      try {
        const response = await fetch(`/api/videos/${video.id}`);
        if (response.ok) {
          const updatedVideo = await response.json();
          setCurrentVideo(updatedVideo);
        }
      } catch (err) {
        console.error("Error reloading video data:", err);
      }
    };

    const intervalId = setInterval(loadVideoData, 30000);
    return () => clearInterval(intervalId);
  }, [video.id, isInitialLoading]);

  return (
    <div className="min-h-screen bg-[#111e19] relative">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
      <main className={isLoading ? "pointer-events-none opacity-50" : ""}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <Link
                  href="/"
                  className="flex-shrink-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <div className="min-w-0 flex-1">
                  <h1
                    className="text-3xl font-bold leading-tight tracking-tight text-white break-words"
                    style={{ wordBreak: "break-word" }}
                  >
                    {currentVideo.title}
                  </h1>
                </div>
              </div>

              {!isInitialLoading && (
                <div className="flex justify-end mt-4">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
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
              )}
            </div>

            {isInitialLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
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
                                  const Icon = getStatusIcon(
                                    currentVideo.status
                                  );
                                  return <Icon className="h-5 w-5" />;
                                })()}
                                {currentVideo.status}
                              </span>
                            </div>
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
                            <dt className="font-medium text-gray-200">
                              Script
                            </dt>
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
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-white">
                        Thumbnail
                      </h2>
                      <div className="flex gap-2">
                        <label className="cursor-pointer rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailUpload}
                          />
                        </label>
                        {currentVideo.thumbnailUrl && (
                          <button
                            onClick={handleRemoveThumbnail}
                            className="rounded-md bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {currentVideo.thumbnailUrl ? (
                      <div className="relative w-full h-48 mb-4 group">
                        <Image
                          src={currentVideo.thumbnailUrl}
                          alt={`Thumbnail for ${currentVideo.title}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20">
                            Change
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleThumbnailUpload}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 bg-white/5 rounded-lg mb-4">
                        <p className="text-gray-400 text-sm">No thumbnail</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-[#1a2b24] p-6 shadow">
                    <h2 className="text-lg font-medium text-white mb-4">
                      Tasks
                    </h2>
                    <div className="space-y-6">
                      <TaskList
                        tasks={currentVideo.tasks}
                        onTasksUpdated={handleTasksUpdated}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
