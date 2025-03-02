import { VideoStatus } from "@prisma/client";
import {
  PencilIcon,
  VideoCameraIcon,
  FilmIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { ComponentType } from "react";

// Re-export VideoStatus from Prisma
export { VideoStatus };

// Get the appropriate color classes for a status
export function getStatusColorClasses(status: VideoStatus): string {
  switch (status) {
    case "PLANNING":
      return "bg-blue-500/10 text-blue-500";
    case "RECORDING":
      return "bg-purple-500/10 text-purple-500";
    case "EDITING":
      return "bg-orange-500/10 text-orange-500";
    case "PUBLISHED":
      return "bg-green-500/10 text-green-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

// Get the appropriate icon component for a status
export function getStatusIcon(
  status: VideoStatus
): ComponentType<{ className?: string }> {
  switch (status) {
    case "PLANNING":
      return PencilIcon;
    case "RECORDING":
      return VideoCameraIcon;
    case "EDITING":
      return FilmIcon;
    case "PUBLISHED":
      return CheckCircleIcon;
    default:
      return PencilIcon;
  }
}
