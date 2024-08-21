## Day3

### 先安裝今天會用到的套件

```
yarn add lucide-react 
```

```
npx shadcn-ui@latest init
```
選項全部選預設就好

```
npx shadcn-ui@latest add card button separator
```

- lucide是一個開源的ICON library 我們將會使用裡面的ICON
- shadcn則是一個UI的library, 所有組件都基於tailwind, 並且他會在你的本地建立檔案, 因此你可以更好的客製化

### 定義我們的討論串有哪些內容

```ts
interface IThread {
  id: string; // 討論串的ID
  name: string; // 發文者的名稱
  title: string; // 發文的標題
  content?: string; // 發文的內容
  image?: string; // 圖片的網址
  youtubeID?: string; // youtube的網址
  userId: string; // 發文者的ID
  createdAt: string; // thread被建立的時間
}
```

### 然後我們就可以根據這個interface建立component

建立以下路徑的檔案
>src/components/thread/ThreadComponent.tsx

不能放在src/app下的原因是因為放在app內的檔案結構會被當作路徑  
但這個只是component 所以我們額外建立一個資料夾來保管


```tsx
"use client";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface IThread {
  id: string;
  name: string;
  title: string;
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
    </Card>
  );
};

export default ThreadComponent;


```

然後在我們昨天的檔案(src/app/service/[serviceId]/page.tsx)內import
```tsx
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
```

然後下指令
```
yarn dev
```

你應該就可以在
```
http://localhost:3000/service/test
```
看到畫面了

### 觀念解釋

- 在ThreadComponent頂端中 有一個'useClient' 這表示我們要讓這的畫面在client端中render, 減少server的負擔
- Nextjs中 如果沒有加上'useClient' 都會預設使用SSR
- 我們只能在'useClient'的頁面中使用 state等React的特性 (SSR中沒辦法使用useState)

## 總結

你可以將這個component拆解得更細  
我這邊是為了講解方便 所以將所有component塞在同一個檔案裡面

你可以試著修改page內的threads  
看看畫面的變化

**你說今天安裝的有些套件沒用到?**

因為太長了 我把它拆到明天去