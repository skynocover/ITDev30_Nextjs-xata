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
    replies: [
      {
        id: "1-1",
        name: "Great resource for beginners",
        content: "You should check out the official TypeScript documentation.",
        image: "https://picsum.photos/200/200",
        userId: "user234",
        createdAt: "2024-08-21T11:00:00Z",
      },
      {
        id: "1-2",
        name: "Try this course",
        content: "Udemy has a great course on TypeScript for beginners.",
        image: "https://picsum.photos/300/200",
        userId: "user345",
        createdAt: "2024-08-21T11:15:00Z",
      },
      {
        id: "1-3",
        name: "Consider this book",
        content:
          "I recommend 'TypeScript Quickly'. It's a great book for getting started.",
        image: "https://picsum.photos/250/250",
        userId: "user456",
        createdAt: "2024-08-21T11:30:00Z",
      },
      {
        id: "1-4",
        name: "Interactive tutorials",
        content:
          "Check out TypeScript exercises on freeCodeCamp or Codecademy.",
        image: "https://picsum.photos/300/300",
        userId: "user567",
        createdAt: "2024-08-21T11:45:00Z",
      },
    ],
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
    replies: [
      {
        id: "2-1",
        name: "React is more flexible",
        content:
          "I prefer React because it gives me more flexibility in how I structure my projects.",
        image: "https://picsum.photos/400/400",
        userId: "user678",
        createdAt: "2024-08-20T15:00:00Z",
      },
    ],
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
    replies: [
      {
        id: "3-1",
        name: "Next.js is awesome!",
        content:
          "I agree, Next.js has a lot of great features, especially for SSR.",
        image: "https://picsum.photos/350/350",
        userId: "user890",
        createdAt: "2024-08-19T09:30:00Z",
      },
      {
        id: "3-2",
        name: "Static site generation",
        content: "Have you tried static site generation? It's super fast.",
        image: "https://picsum.photos/300/400",
        userId: "user901",
        createdAt: "2024-08-19T09:45:00Z",
      },
      {
        id: "3-3",
        name: "Deployment options",
        content: "Vercel makes deploying Next.js apps really easy.",
        image: "https://picsum.photos/400/300",
        userId: "user012",
        createdAt: "2024-08-19T10:00:00Z",
      },
    ],
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
