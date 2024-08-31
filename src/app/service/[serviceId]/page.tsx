import React from "react";
import ThreadComponent from "@/components/thread/ThreadComponent";
import Title from "@/components/layout/Title";

import PostCard from "@/components/thread/PostCard";
import { getService } from "@/lib/database/service";
import { getThreads } from "@/lib/database/thread";
import { notFound } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: { serviceId: string };
  searchParams: { page?: string };
}) {
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 10;

  const service = await getService({ serviceId: params.serviceId });
  if (!service) {
    return notFound();
  }

  const { threads, totalPages } = await getThreads({
    serviceId: params.serviceId,
    page: currentPage,
    pageSize,
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      <Title service={service} />
      <PostCard
        serviceId={params.serviceId}
        description={service.description || ""}
      />

      {threads.map((thread) => (
        <ThreadComponent
          key={thread.id}
          serviceId={params.serviceId}
          thread={thread}
        />
      ))}
    </div>
  );
}
