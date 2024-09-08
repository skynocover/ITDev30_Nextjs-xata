import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  console.log({ session });

  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  const testGroup = Math.random() < 0.5 ? "A" : "B";
  const response = NextResponse.next();
  response.cookies.set("test_group", testGroup);

  // 繼續處理請求
  return response;
}

export const config = {
  matcher: "/:path*/about",
};
