# Day5 優化Service的顯示 - 介紹Nextjs的Link

## 型別定義

我們現在要優化我們的Service  
增加一些跟Service有關的外部連結

```ts
export interface ILinkItem {
  name: string;
  url: string;
}

export interface IService {
  id: string;
  name: string;
  topLinks: ILinkItem[]; //頁面頂端的連結
  headLinks: ILinkItem[]; // 在title下面的連結
  description: string;
}
```

## 製作component

根據這個interface實作出component

位置就放在
```
src/components/layout/Title.tsx
```

```tsx
import Link from "next/link";
import { ExternalLink, Link2 } from "lucide-react";

export interface ILinkItem {
  name: string;
  url: string;
}

export interface IService {
  id: string;
  name: string;
  topLinks: ILinkItem[];
  headLinks: ILinkItem[];
  description: string;
}

interface TitleProps {
  service: IService;
}

export default function Title({ service }: TitleProps) {
  return (
    <>
      <div className="absolute top-2 right-2 flex items-center space-x-2 text-xs">
        {service.topLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            className="text-gray-400 hover:text-gray-600 flex items-center"
          >
            {link.name} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        ))}
        <Link
          href={`/service/${service.id}`}
          className="text-gray-400 hover:text-gray-600 flex items-center"
        >
          Homepage <Link2 className="ml-1 h-3 w-3" />
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-center mb-2 mt-6 text-black">
        {service.name}
      </h1>
      <p className="text-sm text-gray-500 text-center whitespace-pre-wrap mb-2">
        {service.description}
      </p>
      <div className="flex justify-center mb-2 space-x-2">
        {service.headLinks.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            passHref
            target="_blank"
            className="text-blue-500 text-md py-1 px-2 rounded shadow-md border-2 border-blue-400 hover:bg-blue-500 hover:border-blue-500 hover:text-white transition duration-300"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </>
  );
}

```

### 然後import到page.tsx內

```tsx
import React from "react";
import ThreadComponent, { IThread } from "@/components/thread/ThreadComponent";
import Title, { IService } from "@/components/layout/Title";

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

  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      <Title service={service} />

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

現在你的頁面應該可以看到相關連結了

## 觀念解釋

我們可以看到程式碼中 有兩種連結
```tsx
{service.topLinks.map((link, index) => (
  <a
    key={index}
    href={link.url}
    target="_blank"
    className="text-gray-400 hover:text-gray-600 flex items-center"
  >
    {link.name} <ExternalLink className="ml-1 h-3 w-3" />
  </a>
))}
<Link
  href={`/service/${service.id}`}
  className="text-gray-400 hover:text-gray-600 flex items-center"
>
  Homepage <Link2 className="ml-1 h-3 w-3" />
</Link>
```

一種是`<a>` 另外一種則是`<Link/>`

當你的連結是在內部連結時 例如程式碼中的`/service/${service.id}`  
會連結到同一個網址下的不同router  
這時就會建議使用`<Link/>`

`<Link/>`是由Nextjs提供的特性 
有以下幾種好處 
- 使用 JavaScript 來處理頁面轉換，不需要完整的頁面刷新
- 在生產環境中，Link 組件會自動預取連接到的頁面的 JavaScript 代碼
- 使用 Link 在頁面間導航時，Next.js 會自動管理滾動位置 回到前一頁時，它會恢復原來的滾動位置

傳統的`<a>`會讓整個頁面重新載入 對使用者來說並不友好

總之都是為了要讓使用者更好的操作

## 總結

我們今天優化了service的title 並且增加了內部及外部連結

為了要同時具備SSR的優勢 同時讓使用者保有CSR的流暢度 Nextjs新增了一些他自己的特性 在使用上需要特別注意



