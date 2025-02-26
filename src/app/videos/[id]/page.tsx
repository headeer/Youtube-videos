import { notFound } from "next/navigation";
import VideoDetailClient from "@/components/VideoDetailClient";
import { prisma } from "@/lib/prisma";
import { VideoStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

async function getVideo(id: string): Promise<VideoIdea | null> {
  try {
    const video = await prisma.videoIdea.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!video) {
      return null;
    }

    return video as VideoIdea;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

export default async function VideoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!params?.id) {
    notFound();
  }

  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }

  return <VideoDetailClient video={video} />;
}
