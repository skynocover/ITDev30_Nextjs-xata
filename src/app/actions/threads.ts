"use server";
import { headers } from "next/headers";

import { extractYouTubeVideoId, generateUserId } from "@/lib/utils/threads";
import { XataClient } from "@/xata";
import { auth } from "@/auth";

export interface Image {
  name: string;
  mediaType: string;
  base64Content: string;
  enablePublicUrl: boolean;
}
interface CreateThreadParams {
  serviceId: string;
  name?: string;
  title?: string;
  content?: string;
  youtubeLink?: string;
  image?: Image | null;
}

export const createThread = async ({
  serviceId,
  name,
  title,
  content,
  youtubeLink,
  image,
}: CreateThreadParams) => {
  const ip = await getClientIP();
  const userId = generateUserId(ip);

  const xata = new XataClient({
    branch: serviceId,
    apiKey: process.env.XATA_API_KEY,
  });

  const service = await xata.db.services.getFirst();

  if (!service) {
    throw new Error("Service not found");
  }

  if (service.permissions.adminOnlyThread) {
    const session = await auth();
    if (session?.user?.id !== "admin") {
      throw new Error("You don't have permission");
    }
  }

  await xata.db.threads.create({
    title: (title && title.trim()) || "Untitled",
    name: (name && name.trim()) || "anonymous",
    content,
    youtubeID: youtubeLink ? extractYouTubeVideoId(youtubeLink) : undefined,
    image,
    replyAt: new Date(),
    userId,
    userIp: ip,
  });
};

export async function getClientIP() {
  const headersList = headers();

  const forwardedFor = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");

  let clientIP: string | null = null;

  if (forwardedFor) {
    clientIP = forwardedFor.split(",")[0].trim();
  } else if (realIP) {
    clientIP = realIP;
  }

  return clientIP || "Unknown";
}
