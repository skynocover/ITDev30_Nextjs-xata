import React from "react";
import ThreadComponent, { IThread } from "@/components/thread/ThreadComponent";

const threads: IThread[] = [
  {
    id: "1",
    name: "John Doe",
    title: "How to learn TypeScript",
    content:
      "I'm new to TypeScript and looking for resources to get started. Any recommendations?",
    image: "https://picsum.photos/400/300",
    youtubeID: "abc123",
    userId: "user123",
    createdAt: "2024-08-21T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    title: "React vs Angular: Which is better?",
    content:
      "I'm trying to decide between React and Angular for my next project. What are your thoughts?",
    image: "https://picsum.photos/500/300",
    youtubeID: "def456",
    userId: "user456",
    createdAt: "2024-08-20T14:45:00Z",
  },
  {
    id: "3",
    name: "Alice Johnson",
    title: "My journey with Next.js",
    content:
      "I've been using Next.js for a few months now, and it's been a great experience. Here's what I've learned.",
    image: "https://picsum.photos/400/400",
    youtubeID: "ghi789",
    userId: "user789",
    createdAt: "2024-08-19T09:15:00Z",
  },
];

export default async function Page({
  params,
}: {
  params: { serviceId: string };
}) {
  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      {params.serviceId}

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
