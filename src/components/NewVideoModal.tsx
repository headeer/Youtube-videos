"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { VideoStatus } from "@prisma/client";

interface VideoMetadata {
  tags: string[];
  category: string;
}

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  phase: string;
  order: number;
  notes?: string;
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

interface NewVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoCreated: (video: VideoIdea) => void;
}

export default function NewVideoModal({
  isOpen,
  onClose,
  onVideoCreated,
}: NewVideoModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    plannedDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create video");
      }

      const video = await response.json();
      onVideoCreated(video);
      onClose();
      setFormData({ title: "", description: "", plannedDate: "" });
    } catch (error) {
      console.error("Error creating video:", error);
      alert("Failed to create video. Please try again.");
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-[#111e19] px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-lg">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-transparent text-gray-400 hover:text-gray-200"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-white mb-6"
                    >
                      Create New Video Idea
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-200 mb-2"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          required
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2"
                          placeholder="Enter video title"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-200 mb-2"
                        >
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={4}
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2"
                          placeholder="Enter video description"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="plannedDate"
                          className="block text-sm font-medium text-gray-200 mb-2"
                        >
                          Planned Date
                        </label>
                        <input
                          type="date"
                          id="plannedDate"
                          required
                          value={formData.plannedDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              plannedDate: e.target.value,
                            })
                          }
                          className="block w-full rounded-md bg-white/5 border-0 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#40f99b] px-3 py-2"
                        />
                      </div>

                      <div className="mt-8 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-md bg-[#40f99b] px-3 py-2 text-sm font-medium text-[#111e19] hover:bg-[#40f99b]/90"
                        >
                          Create Video
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
