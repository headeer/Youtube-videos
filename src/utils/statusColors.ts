import {
  PencilIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  FilmIcon,
  PhotoIcon,
  GlobeAltIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export type VideoStatus =
  | "PLANNING"
  | "SCRIPTING"
  | "RECORDING"
  | "EDITING"
  | "PACKAGING"
  | "DISTRIBUTION"
  | "COMPLETED";

export function getStatusColorClasses(status: VideoStatus) {
  switch (status) {
    case "PLANNING":
      return "bg-blue-400/10 text-blue-400";
    case "SCRIPTING":
      return "bg-purple-400/10 text-purple-400";
    case "RECORDING":
      return "bg-red-400/10 text-red-400";
    case "EDITING":
      return "bg-orange-400/10 text-orange-400";
    case "PACKAGING":
      return "bg-yellow-400/10 text-yellow-400";
    case "DISTRIBUTION":
      return "bg-green-400/10 text-green-400";
    case "COMPLETED":
      return "bg-emerald-400/10 text-emerald-400";
    default:
      return "bg-gray-400/10 text-gray-400";
  }
}

export function getStatusIcon(status: VideoStatus) {
  switch (status) {
    case "PLANNING":
      return PencilIcon;
    case "SCRIPTING":
      return DocumentTextIcon;
    case "RECORDING":
      return VideoCameraIcon;
    case "EDITING":
      return FilmIcon;
    case "PACKAGING":
      return PhotoIcon;
    case "DISTRIBUTION":
      return GlobeAltIcon;
    case "COMPLETED":
      return CheckCircleIcon;
    default:
      return PencilIcon;
  }
}
