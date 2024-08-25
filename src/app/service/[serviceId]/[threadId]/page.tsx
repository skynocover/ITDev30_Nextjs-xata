import React from "react";
import { notFound } from "next/navigation";

import Title, { IService } from "@/components/layout/Title";
import ThreadComponent from "@/components/thread/ThreadComponent";
import { threads } from "../page";

export default async function Page({
  params,
}: {
  params: { threadId: string; serviceId: string };
}) {
  const service: IService = {
    id: params.serviceId,
    name: "My Service",
    topLinks: [{ name: "Nextjs", url: "https://nextjs.org/" }],
    headLinks: [
      {
        name: "鐵人賽",
        url: "https://ithelp.ithome.com.tw/users/20168796/ironman/7445",
      },
      { name: "ithome", url: "https://ithelp.ithome.com.tw/" },
    ],
    description: "This is an example service providing various utilities.",
  };

  const thread = threads.find((t) => t.id === params.threadId);

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
