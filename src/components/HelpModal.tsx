import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface HelpModalProps {
  content: string;
  title: string;
}

export default function HelpModal({ content, title }: HelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-gray-300 focus:outline-none"
      >
        <InformationCircleIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[#111e19]/75 transition-opacity backdrop-blur-sm z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative transform overflow-hidden rounded-lg glass-effect px-4 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                  <h3 className="text-xl font-medium text-white">{title}</h3>
                  <button
                    onClick={() => setIsOpen(false)}
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
                  <div className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                    {content}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
