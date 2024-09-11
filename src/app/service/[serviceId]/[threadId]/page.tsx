import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import Title from "@/components/layout/Title";
import ThreadComponent from "@/components/thread/ThreadComponent";

import { getService } from "@/lib/database/service";
import { getThread } from "@/lib/database/thread";

async function getThreadData(serviceId: string, threadId: string) {
  const thread = await getThread({ serviceId, threadId });
  return { thread };
}

export const generateMetadata = async ({
  params,
}: {
  params: { threadId: string; serviceId: string };
}): Promise<Metadata> => {
  const { thread } = await getThreadData(params.serviceId, params.threadId);
  return {
    openGraph: {
      title: thread?.title || "Thread Title",
      images: [
        {
          url: thread?.image || "",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
};

export default async function Page({
  params,
}: {
  params: { threadId: string; serviceId: string };
}) {
  const service = await getService({ serviceId: params.serviceId });
  if (!service) {
    return notFound();
  }

  const { thread } = await getThreadData(params.serviceId, params.threadId);

  if (!thread) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      <Title service={service} />
      <ThreadComponent
        serviceId={params.serviceId}
        thread={thread}
        isPage={true}
      />
    </div>
  );
}
