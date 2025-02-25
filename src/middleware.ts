import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const videoIdPattern = /^\/videos\/([^\/]+)$/;
  const match = request.nextUrl.pathname.match(videoIdPattern);

  if (match) {
    const videoId = match[1];
    if (!videoId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/videos/:id*",
};
