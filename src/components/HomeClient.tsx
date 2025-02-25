"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  PlusIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  TrashIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import NewVideoModal from "./NewVideoModal";
import { getStatusColorClasses, getStatusIcon } from "@/utils/statusColors";

export type VideoStatus =
  | "PLANNING"
  | "SCRIPTING"
  | "RECORDING"
  | "EDITING"
  | "PACKAGING"
  | "DISTRIBUTION"
  | "COMPLETED";

interface VideoIdea {
  id: string;
  title: string;
  status: VideoStatus;
  plannedDate: Date;
  isUploaded: boolean;
}

interface Excuse {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function HomeClient() {
  const [videos, setVideos] = useState<VideoIdea[]>([]);
  const [isNewVideoModalOpen, setIsNewVideoModalOpen] = useState(false);
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [newExcuse, setNewExcuse] = useState("");
  const [filters, setFilters] = useState({
    status: "" as VideoStatus | "",
    isUploaded: "",
    dateFrom: "",
    dateTo: "",
  });
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

  useEffect(() => {
    setVideos([]);
  }, []);

  const loadExcuses = async () => {
    try {
      const response = await fetch("/api/excuses");
      if (response.ok) {
        const data = await response.json();
        setExcuses(data);
      }
    } catch (error) {
      console.error("Error loading excuses:", error);
    }
  };

  useEffect(() => {
    if (isExcuseModalOpen) {
      loadExcuses();
    }
  }, [isExcuseModalOpen]);

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
      }
    } catch (error) {
      console.error("Error adding excuse:", error);
    }
  };

  const handleUseExcuse = async (excuseId: string, videoId: string) => {
    try {
      const response = await fetch("/api/excuses/use", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ excuseId, videoId }),
      });

      if (response.ok) {
        // Update the excuse count in the UI
        setExcuses(
          excuses.map((excuse) =>
            excuse.id === excuseId
              ? { ...excuse, updatedAt: new Date() }
              : excuse
          )
        );
      }
    } catch (error) {
      console.error("Error using excuse:", error);
    }
  };

  const handleVideoDeleted = (deletedVideoId: string) => {
    setVideos((currentVideos) =>
      currentVideos.filter((video) => video.id !== deletedVideoId)
    );
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
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Videos Section */}
          <div className="lg:col-span-2">
            {/* Filters */}
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
                      className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] py-2.5 pl-3 pr-10 cursor-pointer"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <CalendarDaysIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    To
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters({ ...filters, dateTo: e.target.value })
                      }
                      className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] py-2.5 pl-3 pr-10 cursor-pointer"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <CalendarDaysIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mt-4">
              <div className="glass-effect rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Planned Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Upload Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredVideos.map((video) => (
                      <tr
                        key={video.id}
                        className="hover:bg-white/[0.025] transition-colors group"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white">
                          {video.title}
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
                            ? format(new Date(video.plannedDate), "MMM d, yyyy")
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
              <div className="p-4 space-y-2">
                {excuses.map((excuse) => (
                  <div
                    key={excuse.id}
                    className="flex items-center justify-between glass-effect rounded-md p-3 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center bg-[#40f99b]/10 text-[#40f99b] rounded-full w-8 h-8 font-medium">
                        {excuse.text}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleUseExcuse(excuse.id, videos[0]?.id)
                        }
                        className="rounded-md bg-indigo-500 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-600"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this excuse?"
                            )
                          ) {
                            fetch(`/api/excuses/${excuse.id}`, {
                              method: "DELETE",
                            }).then((response) => {
                              if (response.ok) {
                                handleVideoDeleted(excuse.id);
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
                ))}
                {excuses.length === 0 && (
                  <p className="text-[#d9d9d9] text-sm text-center py-4">
                    No excuses added yet. Add one to track why you&apos;re not
                    recording!
                  </p>
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
                    <h3 className="text-lg font-medium leading-6 mb-4">
                      Add New Excuse
                    </h3>
                    <div className="mt-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newExcuse}
                          onChange={(e) => setNewExcuse(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddExcuse();
                            }
                          }}
                          placeholder="Why aren't you recording today?"
                          className="flex-1 rounded-md bg-[#111e19]/50 border-0 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] py-2.5 px-3"
                        />
                        <button
                          onClick={handleAddExcuse}
                          className="rounded-md bg-[#40f99b] px-4 py-2.5 text-sm font-medium text-[#111e19] shadow-sm hover:bg-[#40f99b]/90 focus:outline-none focus:ring-2 focus:ring-[#40f99b] focus:ring-offset-2 focus:ring-offset-[#111e19]"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-[#111e19]/50 px-3 py-2 text-sm font-medium shadow-sm hover:bg-[#111e19]/70"
                      onClick={() => setIsExcuseModalOpen(false)}
                    >
                      Close
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
        />
      </div>
    </div>
  );
}
