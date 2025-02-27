-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PLANNING', 'RECORDING', 'EDITING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "TaskPhase" AS ENUM ('PLANNING', 'RECORDING', 'EDITING', 'THUMBNAIL', 'METADATA', 'DISTRIBUTION');

-- CreateTable
CREATE TABLE "VideoIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "script" TEXT,
    "metadata" JSONB,
    "thumbnailUrl" TEXT,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "finishDate" TIMESTAMP(3),
    "status" "VideoStatus" NOT NULL DEFAULT 'PLANNING',
    "isUploaded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "phase" "TaskPhase" NOT NULL,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "videoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "trendScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Excuse" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Excuse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcuseUse" (
    "id" TEXT NOT NULL,
    "excuseId" TEXT NOT NULL,
    "videoIdeaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExcuseUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TopicToVideoIdea" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TopicToVideoIdea_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TopicToVideoIdea_B_index" ON "_TopicToVideoIdea"("B");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcuseUse" ADD CONSTRAINT "ExcuseUse_videoIdeaId_fkey" FOREIGN KEY ("videoIdeaId") REFERENCES "VideoIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcuseUse" ADD CONSTRAINT "ExcuseUse_excuseId_fkey" FOREIGN KEY ("excuseId") REFERENCES "Excuse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicToVideoIdea" ADD CONSTRAINT "_TopicToVideoIdea_A_fkey" FOREIGN KEY ("A") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicToVideoIdea" ADD CONSTRAINT "_TopicToVideoIdea_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
