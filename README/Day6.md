# 製作thread頁面 - nextjs的notFound

## 建立頁面

我們現在需要做一個thread頁面  
並且讓Service頁面可以連結過去

### 先在service頁面中將我們的假資料threads給export出去

```tsx
export const threads: IThread[] = [...];
```

### 然後在我們需要的route頁面建立檔案

> app/service/[serviceId]/[threadId]/page.tsx

```tsx
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
      />
    </div>
  );
}
```

## notFound

這裏我們使用了一個新的nextjs的特性  
也就是notFound

這將立刻停止當前的渲染流程 並回傳一個 404 錯誤頁面

以往要再nextjs中 觸發這個頁面 需要回傳特定的http的狀態碼或是手動轉導向  
但是notFound簡化了這個過程

### 嘗試頁面

在我們的thread頁面中

```ts
const thread = threads.find((t) => t.id === params.threadId);
if (!thread) {
  return notFound();
}
``` 

我們將會根據路徑內的serviceId去找對應的thread  
如果沒有找到則回傳404頁面

你可以嘗試進入以下的頁面

> http://localhost:3000/service/test/1

應該可以正常瀏覽

但是進入到

> http://localhost:3000/service/test/4

時 會回傳404的頁面  
這是因為在我們準備的假資料中 沒有threadId為4的資料

## 修改ThreadComponent

我們會希望可以在service頁面 點選thread以方便我們看這個thread的內容

例如在thread中點選標題 然後就連結到thread的頁面

### 修改component的props

修改src/components/thread/ThreadComponents.tsx

```ts
interface ThreadComponentProps {
  serviceId: string;
  thread: IThread;
  isPage?: boolean; // 確認現在是在Service或是Thread
}
```

對應的component也要修改

```ts
const ThreadComponent: React.FC<ThreadComponentProps> = ({
  thread,
  serviceId,
  isPage = false, //預設為service
}) => { ...
```

### 修改畫面

```ts
// 如果是thread頁面 就不需要隱藏多餘的回應了 因為只有一個thread
const visibleReplies =
    !isPage && !showAllReplies
      ? thread.replies.slice(-visibleRepliesNum)
      : thread.replies;
```

在title部分 加上Link
```tsx
<CardTitle className={"text-2xl font-bold text-center"}>
  {isPage ? (
    <> {thread.title}</>
  ) : (
    <Link
      href={`/service/${serviceId}/${thread.id}`}
      className="hover:underline"
    >
      {thread.title}
    </Link>
  )}
</CardTitle>
```

如果是thread頁面 就不需要展開或折疊的button

```tsx
<Separator className="mb-4" />
  {!isPage && thread.replies.length > visibleRepliesNum && (
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
```

全部的程式碼如下
```tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";

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
  isPage?: boolean;
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
  isPage = false,
}) => {
  const [showAllReplies, setShowAllReplies] = useState(false);
  const visibleRepliesNum = 2;
  const visibleReplies =
    !isPage && !showAllReplies
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
            {isPage ? (
              <> {thread.title}</>
            ) : (
              <Link
                href={`/service/${serviceId}/${thread.id}`}
                className="hover:underline"
              >
                {thread.title}
              </Link>
            )}
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
          {!isPage && thread.replies.length > visibleRepliesNum && (
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


這些都改好之後 回到src/app/service/[serviceId]/[threadId]/page.tsx

### 修改thread頁面的component

```tsx
<ThreadComponent
  serviceId={params.serviceId}
  thread={thread}
  isPage={true}
/>
```

接著來到

> http://localhost:3000/service/test

你應該就可以看到修改的結果

## 總結

今天我們介紹了nextjs的notFound特性  
並且修改了畫面 讓service頁面可以連結到thread頁面

Read相關的部分做完了之後 明天我們可以來做Write的部分


