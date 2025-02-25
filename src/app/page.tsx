import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  const videos = await prisma.videoIdea.findMany({
    orderBy: {
      plannedDate: "asc",
    },
  });

  return <HomeClient initialVideos={videos} />;
}
