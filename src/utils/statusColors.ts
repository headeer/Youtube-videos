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
      return "bg-blue-100 text-blue-800";
    case "RECORDING":
      return "bg-purple-100 text-purple-800";
    case "EDITING":
      return "bg-orange-100 text-orange-800";
    case "PUBLISHED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
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
      return CheckCircleIcon;
  }
}
