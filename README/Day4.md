# Day4

## 先定義型別

現在我們需要幫每個討論串加上回覆

```ts
export interface IThread {
  id: string;
  name: string;
  title: string;
  content?: string;
  image?: string;
  youtubeID?: string;
  userId: string;
  createdAt: string;
  replies: IReply[]; // 每個討論串都有自己的回覆
}

export interface IReply {
  id: string;
  name: string;
  content?: string;
  image?: string;
  youtubeID?: string;
  userId: string;
  createdAt: string;
}
```

因為是回覆所以reply沒有title

### 然後我們需要修改我們的假資料

讓每一個thread都有自己的replies

```ts
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
```

## 修改ThreadComponent

```ts
"use client";
import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface IThread {
  id: string;
  name: string;
  title: string;
  content?: string;
  image?: string;
  youtubeID?: string;
  userId: string;
  createdAt: string;
  replies: IReply[];
}

export interface IReply {
  id: string;
  name: string;
  content?: string;
  image?: string;
  youtubeID?: string;
  userId: string;
  createdAt: string;
}

interface ThreadComponentProps {
  serviceId: string;
  thread: IThread;
}

export const MediaContent: React.FC<{
  imageURL: string | undefined;
  youtubeID: string | undefined;
}> = ({ imageURL, youtubeID }) => {
  if (imageURL) {
    return (
      <div>
        <img
          src={imageURL}
          className="w-full h-full max-w-full max-h-[400px] object-contain cursor-pointer"
        />
      </div>
    );
  }
  if (youtubeID) {
    return (
      <div className="relative w-full pt-[56.25%]">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeID}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        ></iframe>
      </div>
    );
  }
  return null;
};

const ThreadComponent: React.FC<ThreadComponentProps> = ({
  thread,
  serviceId,
}) => {
  const [showAllReplies, setShowAllReplies] = useState(false);
  const visibleRepliesNum = 2;
  const visibleReplies = !showAllReplies
    ? thread.replies.slice(-visibleRepliesNum)
    : thread.replies;

  return (
    <Card
      id={thread.id}
      className={
        "mb-6 overflow-hidden scroll-mt-20 transition-all duration-300"
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-center">
          <CardTitle className={"text-2xl font-bold text-center"}>
            {thread.title}
          </CardTitle>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
          id={thread.id}
        >
          <span className="font-semibold text-gray-700">{thread.name}</span>
          <span>ID: {thread.userId}</span>
          <span className="ml-auto flex items-center">{thread.createdAt}</span>
          <span className="text-blue-300 ml-1">No: {thread.id}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex flex-col md:flex-row md:space-x-4">
          {thread.image || thread.youtubeID ? (
            <>
              <div className="w-full md:w-1/2 mb-4 md:mb-0 h-auto">
                <MediaContent
                  imageURL={thread.image}
                  youtubeID={thread.youtubeID}
                />
              </div>
              <div className="w-full md:w-1/2">{thread.content}</div>
            </>
          ) : (
            <div className="w-full md:w-1/2 mx-auto">{thread.content}</div>
          )}
        </div>
      </CardContent>
      {thread.replies.length > 0 && (
        <CardFooter className="flex flex-col pt-4">
          <Separator className="mb-4" />
          {thread.replies.length > visibleRepliesNum && (
            <Button
              variant="outline"
              onClick={() => setShowAllReplies(!showAllReplies)}
              className="w-full mb-4"
            >
              {showAllReplies ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" /> Hide Replies
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" /> Show All{" "}
                  {thread.replies.length} Replies
                </>
              )}
            </Button>
          )}
          <div className="space-y-4 w-full">
            {visibleReplies.map((reply, index) => (
              <div key={reply.id} className={"mt-4 scroll-mt-20 $"}>
                {index > 0 && <Separator />}
                <div>
                  <div
                    className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
                    id={reply.id}
                  >
                    <span className="font-semibold text-gray-700">
                      {reply.name}
                    </span>
                    <span>ID: {reply.userId}</span>
                    <span className="ml-auto flex items-center">
                      {reply.createdAt}
                    </span>
                    <span className="text-blue-300 ml-1">No: {reply.id}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-col md:flex-row md:space-x-4">
                      {reply.image || reply.youtubeID ? (
                        <>
                          <div className="w-full md:w-1/2 mb-4 md:mb-0 h-auto">
                            <MediaContent
                              imageURL={reply.image}
                              youtubeID={reply.youtubeID}
                            />
                          </div>
                          <div className="w-full md:w-1/2">{reply.content}</div>
                        </>
                      ) : (
                        <div className="w-full md:w-1/2 mx-auto">
                          {reply.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ThreadComponent;
```

### Nextjs中的useState

程式碼中有一段
```tsx
 <Button
   variant="outline"
   onClick={() => setShowAllReplies(!showAllReplies)}
   className="w-full mb-4"
>
  {showAllReplies ? (
    <>
      <ChevronUp className="mr-2 h-4 w-4" /> Hide Replies
    </>
  ) : (
    <>
      <ChevronDown className="mr-2 h-4 w-4" /> Show All{" "}
        {thread.replies.length} Replies
    </>
  )}
</Button>
```

目的是當回應數量太多時 會隱藏一部分的回應

showAllReplies我們使用了useState來管理狀態

```ts
const [showAllReplies, setShowAllReplies] = useState(false);
```

這個是Client side render才有的功能  

你可以嘗試把ThreadComponent頂端的
```
'use client'
```
給移除

接著你應該就會看到以下的錯誤

```
You're importing a component that needs useState. It only works in a Client Component but none of its parents are marked with "use client", so they're Server Components by default.
```

這是因為SSR會將畫面在**後端生出來之後**把html傳遞給client端  
因此並不會執行任何JS程式碼  
所以useState這種使用js實作出來的React特性 就無法使用

因此在使用Nextjs時 要特別注意哪些畫面是在後端做 哪些是在前端做

## Page

由於page.tsx內的
```
  {params.serviceId}
```
有點醜

因此我們稍微修改一下

```tsx
export default async function Page({
  params,
}: {
  params: { serviceId: string };
}) {
  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      <h1 className="text-3xl font-bold text-center mb-2 mt-6 text-black">
        {params.serviceId}
      </h1>

      {threads.map((thread) => (
        <ThreadComponent
          key={thread.id}
          serviceId={params.serviceId}
          thread={thread}
        />
      ))}
    </div>
  );
```

讓他置中

## 總結

我們今天使用到了Nextjs中React的useState的狀態管理  
並且學習到useState並**不能在後端執行**

這是跟以往的React開發最大的差別 必須特別注意


