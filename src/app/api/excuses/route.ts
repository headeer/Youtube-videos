import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const excuses = await prisma.excuse.findMany({
      include: {
        uses: {
          include: {
            videoIdea: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(excuses);
  } catch (error) {
    console.error("Error fetching excuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch excuses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const excuse = await prisma.excuse.create({
      data: {
        text,
      },
      include: {
        uses: {
          include: {
            videoIdea: true,
          },
        },
      },
    });

    return NextResponse.json(excuse);
  } catch (error) {
    console.error("Error creating excuse:", error);
    return NextResponse.json(
      { error: "Failed to create excuse" },
      { status: 500 }
    );
  }
}
