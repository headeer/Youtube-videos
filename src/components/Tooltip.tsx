import { useState, useRef, useEffect } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface TooltipProps {
  content: string | React.ReactNode;
  title?: string;
}

export default function Tooltip({ content, title }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-gray-300 focus:outline-none"
      >
        <InformationCircleIcon className="h-5 w-5" />
      </button>

      {isVisible && (
        <div className="absolute z-50 w-80 p-4 mt-2 -translate-x-1/2 left-1/2 bg-[#1a2b24] rounded-lg shadow-xl border border-white/10">
          {title && (
            <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
          )}
          <div className="text-sm text-gray-200 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
