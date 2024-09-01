import React from "react";
import { notFound } from "next/navigation";

import Title from "@/components/layout/Title";
import ThreadComponent from "@/components/thread/ThreadComponent";

import { getService } from "@/lib/database/service";
import { getThread } from "@/lib/database/thread";

export default async function Page({
  params,
}: {
  params: { threadId: string; serviceId: string };
}) {
  const service = await getService({ serviceId: params.serviceId });
  if (!service) {
    return notFound();
  }

  const thread = await getThread({
    serviceId: params.serviceId,
    threadId: params.threadId,
  });

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
