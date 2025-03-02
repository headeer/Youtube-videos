import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VideoDetailClient from "@/components/VideoDetailClient";
import { VideoIdea } from "@/types";

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

    // Convert Prisma types to our client types
    return {
      ...video,
      metadata: video.metadata as Record<string, unknown> | undefined,
      tasks: video.tasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      })),
      createdAt: new Date(video.createdAt),
      updatedAt: new Date(video.updatedAt),
      plannedDate: new Date(video.plannedDate),
    };
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
  // Validate params.id before using it
  if (!params?.id || typeof params.id !== "string") {
    notFound();
  }

  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }

  return <VideoDetailClient video={video} />;
}
