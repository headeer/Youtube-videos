"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  PlusIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import NewVideoModal from "./NewVideoModal";
import { getStatusColorClasses, getStatusIcon } from "@/utils/statusColors";
import { VideoStatus as PrismaVideoStatus } from "@prisma/client";

export type VideoStatus = PrismaVideoStatus;

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
}

interface Excuse {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  uses: Array<{
    id: string;
    videoIdea: {
      id: string;
      title: string;
    };
  }>;
}

export default function HomeClient({
  initialVideos,
}: {
  initialVideos: VideoIdea[];
}) {
  const [isNewVideoModalOpen, setIsNewVideoModalOpen] = useState(false);
  const [videos, setVideos] = useState<VideoIdea[]>(initialVideos || []);
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [newExcuse, setNewExcuse] = useState("");
  const [filters, setFilters] = useState({
    status: "" as VideoStatus | "",
    isUploaded: "",
    dateFrom: "",
    dateTo: "",
  });
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingExcuses, setIsLoadingExcuses] = useState(false);

  // Load videos from API
  const loadVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/videos");
      if (!response.ok) {
        throw new Error(`Failed to load videos: ${response.status}`);
      }
      const data = await response.json();
      setVideos(data);
    } catch (err) {
      console.error("Error loading videos:", err);
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setIsLoading(false);
    }
  };

  // Load excuses from API
  const loadExcuses = async () => {
    setIsLoadingExcuses(true);
    try {
      const response = await fetch("/api/excuses?include=uses");
      if (response.ok) {
        const data = await response.json();
        setExcuses(data);
      }
    } catch (error) {
      console.error("Error loading excuses:", error);
    } finally {
      setIsLoadingExcuses(false);
    }
  };

  // Load both videos and excuses on initial mount
  useEffect(() => {
    loadVideos();
    loadExcuses();
  }, []);

  const filteredVideos = videos.filter((video) => {
    if (filters.status && video.status !== filters.status) return false;
    if (filters.isUploaded === "true" && !video.isUploaded) return false;
    if (filters.isUploaded === "false" && video.isUploaded) return false;

    const videoDate = video.plannedDate ? new Date(video.plannedDate) : null;

    if (filters.dateFrom && videoDate) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (videoDate < fromDate) return false;
    }

    if (filters.dateTo && videoDate) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (videoDate > toDate) return false;
    }

    return true;
  });

  const handleAddExcuse = async () => {
    if (!newExcuse.trim()) return;

    try {
      const response = await fetch("/api/excuses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newExcuse }),
      });

      if (response.ok) {
        const excuse = await response.json();
        setExcuses((currentExcuses) => [
          ...currentExcuses,
          {
            ...excuse,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        setNewExcuse("");
        setIsExcuseModalOpen(false); // Close the modal after successful addition
      }
    } catch (error) {
      console.error("Error adding excuse:", error);
    }
  };

  const handleVideoDeleted = (deletedVideoId: string) => {
    setVideos((currentVideos) =>
      currentVideos.filter((video) => video.id !== deletedVideoId)
    );
  };

  const handleVideoCreated = (newVideo: VideoIdea) => {
    setVideos((prev) => [newVideo, ...prev]);
  };

  return (
    <div className="min-h-screen py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold gradient-text">
                Video Ideas
              </h1>
              <p className="mt-2 text-sm text-[#d9d9d9]">
                A list of all your video ideas and their current status.
              </p>
            </div>
            <button
              onClick={() => setIsNewVideoModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#40f99b] px-4 py-2.5 text-sm font-medium text-[#111e19] shadow-sm hover:bg-[#40f99b]/90 focus:outline-none focus:ring-2 focus:ring-[#40f99b] focus:ring-offset-2 focus:ring-offset-[#111e19]"
            >
              <PlusIcon className="h-6 w-6 mr-2" />
              New Video
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass-effect rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-white/10">
                <FunnelIcon className="h-5 w-5 text-[#40f99b]" />
                <h2 className="text-lg font-medium">Filters</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 p-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        status: e.target.value as VideoStatus | "",
                      })
                    }
                    className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 py-2.5 pl-3 pr-8 cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white"
                  >
                    <option value="">All</option>
                    {[
                      "PLANNING",
                      "SCRIPTING",
                      "RECORDING",
                      "EDITING",
                      "PACKAGING",
                      "DISTRIBUTION",
                      "COMPLETED",
                    ].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Uploaded
                  </label>
                  <select
                    value={filters.isUploaded}
                    onChange={(e) =>
                      setFilters({ ...filters, isUploaded: e.target.value })
                    }
                    className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 py-2.5 pl-3 pr-8 cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white"
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    From
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters({ ...filters, dateFrom: e.target.value })
                      }
                      className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] py-2.5 pl-3 pr-2 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    To
                  </label>
                  <div className="relative w-full">
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters({ ...filters, dateTo: e.target.value })
                      }
                      className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] py-2.5 pl-3 pr-2 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Videos Table */}
            <div className="mt-4">
              <div className="glass-effect rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <div className="text-red-500 mb-2">
                      Error loading videos
                    </div>
                    <p className="text-white">{error}</p>
                    <button
                      onClick={loadVideos}
                      className="mt-4 px-4 py-2 bg-[#40f99b] text-[#111e19] rounded-md hover:bg-[#40f99b]/90"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredVideos.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-white">
                      No videos found. Create your first video idea!
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-white/10">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Planned Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Upload Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredVideos.map((video) => (
                        <tr
                          key={video.id}
                          className="hover:bg-white/[0.025] transition-colors group"
                        >
                          <td className="py-4 pl-4 pr-3 text-sm">
                            <div className="flex items-center">
                              <p
                                className="font-medium text-white max-w-[300px] truncate"
                                title={video.title}
                              >
                                {video.title}
                              </p>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${getStatusColorClasses(
                                video.status
                              )}`}
                            >
                              {(() => {
                                const Icon = getStatusIcon(video.status);
                                return <Icon className="h-4 w-4" />;
                              })()}
                              {video.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                            {video.plannedDate
                              ? format(
                                  new Date(video.plannedDate),
                                  "MMM d, yyyy"
                                )
                              : "No date set"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                            {video.isUploaded ? "Uploaded" : "Not Uploaded"}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-4">
                              <Link
                                href={`/videos/${video.id}`}
                                className="text-indigo-400 hover:text-indigo-300"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this video?"
                                    )
                                  ) {
                                    fetch(`/api/videos/${video.id}`, {
                                      method: "DELETE",
                                    }).then((response) => {
                                      if (response.ok) {
                                        handleVideoDeleted(video.id);
                                      }
                                    });
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Excuses Section */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-[#cc4429]" />
                  <h2 className="text-lg font-medium">Why Not Recording?</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExcuseModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-md bg-[#cc4429] px-2.5 py-1.5 text-sm font-medium text-white hover:bg-[#ff9459] focus:outline-none focus:ring-2 focus:ring-[#cc4429] focus:ring-offset-2 focus:ring-offset-[#111e19]"
                >
                  Add Excuse
                </button>
              </div>
              <div className="p-4">
                {isLoadingExcuses ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {excuses.map((excuse) => (
                      <div
                        key={excuse.id}
                        className="glass-effect rounded-md p-3 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p
                                className="text-sm text-white break-words"
                                style={{ wordBreak: "break-word" }}
                              >
                                {excuse.text}
                              </p>
                              <div className="mt-1 text-xs text-[#40f99b]">
                                Used {excuse.uses?.length || 0} times
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={async () => {
                                  if (!videos.length) {
                                    alert(
                                      "No videos available to use this excuse with!"
                                    );
                                    return;
                                  }
                                  try {
                                    const response = await fetch(
                                      "/api/excuses/use",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          excuseId: excuse.id,
                                          videoId: videos[0].id,
                                        }),
                                      }
                                    );

                                    const data = await response.json();

                                    if (!response.ok) {
                                      throw new Error(
                                        data.error || "Failed to use excuse"
                                      );
                                    }

                                    setExcuses((prevExcuses) =>
                                      prevExcuses.map((e) =>
                                        e.id === excuse.id ? data : e
                                      )
                                    );
                                  } catch (error) {
                                    console.error("Error using excuse:", error);
                                    alert(
                                      error instanceof Error
                                        ? error.message
                                        : "Failed to use excuse. Please try again."
                                    );
                                  }
                                }}
                                className="rounded-md bg-indigo-500 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-600"
                              >
                                Use
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this excuse?"
                                    )
                                  ) {
                                    fetch(`/api/excuses/${excuse.id}`, {
                                      method: "DELETE",
                                    }).then((response) => {
                                      if (response.ok) {
                                        loadExcuses();
                                      }
                                    });
                                  }
                                }}
                                className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Added{" "}
                            {format(new Date(excuse.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                    {excuses.length === 0 && (
                      <p className="text-[#d9d9d9] text-sm text-center py-4">
                        No excuses added yet. Add one to track why you&apos;re
                        not recording!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Excuse Modal */}
        {isExcuseModalOpen && (
          <div className="fixed inset-0 bg-[#111e19]/75 transition-opacity backdrop-blur-sm">
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg glass-effect px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium leading-6">
                        Add New Excuse
                      </h3>
                      <button
                        onClick={() => setIsExcuseModalOpen(false)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2">
                      <textarea
                        value={newExcuse}
                        onChange={(e) => setNewExcuse(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddExcuse();
                          }
                        }}
                        placeholder="Why aren't you recording today?"
                        rows={3}
                        className="w-full rounded-md bg-[#111e19]/50 border-0 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] py-2.5 px-3 text-white resize-none"
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-[#111e19]/50 px-3 py-2 text-sm font-medium shadow-sm hover:bg-[#111e19]/70"
                      onClick={() => setIsExcuseModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddExcuse}
                      disabled={!newExcuse.trim()}
                      className="rounded-md bg-[#40f99b] px-4 py-2 text-sm font-medium text-[#111e19] shadow-sm hover:bg-[#40f99b]/90 focus:outline-none focus:ring-2 focus:ring-[#40f99b] focus:ring-offset-2 focus:ring-offset-[#111e19] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Excuse
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <NewVideoModal
          isOpen={isNewVideoModalOpen}
          onClose={() => setIsNewVideoModalOpen(false)}
          onVideoCreated={handleVideoCreated}
        />
      </div>
    </div>
  );
}
