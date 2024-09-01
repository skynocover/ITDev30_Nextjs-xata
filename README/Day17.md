## 我們要來實作我們的首頁

## 我們想要在首頁顯示目前最新的幾個thread

在你的`src/lib/database/thread.ts`中 新增下的function

原因是因為我們在首頁不需要顯示回覆 只需要顯示回覆的數量就好
減少DB的負擔

```ts
// for home page

export type ThreadWithReplyCount = WithoutImage<ThreadsRecord> & {
  image?: string;
  replyCount: number;
};

export const getThreadsWithReplyCount = async ({
  serviceId,
  pageSize = 10,
}: IGetThreads): Promise<ThreadWithReplyCount[]> => {
  try {
    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });

    const { records: threads } = await xata.db.threads
      .sort("replyAt", "desc")
      .getPaginated({ pagination: { size: pageSize } });

    const threadsWithReplies: ThreadWithReplyCount[] = await Promise.all(
      threads.map(async (thread) => {
        const { aggs } = await xata.db.replies.aggregate(
          { totalCount: { count: "*" } },
          { thread: { id: thread.id } }
        );

        return {
          ...thread,
          image: thread.image?.url,
          replyCount: aggs.totalCount,
        };
      })
    );

    return threadsWithReplies;
  } catch (error) {
    console.error(error);
    return [];
  }
};

```

### 接著新增Carousel的component

在`src/components/homepage/ThreadCarousel.tsx`中 新增以下的code

```tsx
"use client";
import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ThreadWithReplyCount } from "@/lib/database/thread";
import { formateTime } from "@/lib/utils/timeformate";
import { PostContent } from "../thread/PostContent";
import { MediaContent } from "../thread/ThreadComponent";

interface ThreadCarouselProps {
  serviceId: string;
  threads: ThreadWithReplyCount[];
}

export const ThreadCarousel: React.FC<ThreadCarouselProps> = ({
  serviceId,
  threads,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const renderPreview = (thread: ThreadWithReplyCount) => {
    if (thread.image || thread.youtubeID) {
      return (
        <div className="h-40 w-full overflow-hidden">
          <MediaContent
            imageURL={thread.image || ""}
            youtubeID={thread.youtubeID || ""}
          />
        </div>
      );
    } else {
      return (
        <div className="h-40 p-4 overflow-hidden">
          <PostContent content={thread.content || ""} />
        </div>
      );
    }
  };

  return (
    <div className="relative">
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-4 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {threads.map((thread) => (
          <Card
            key={thread.id}
            className="snap-start flex-shrink-0 w-72 h-full hover:shadow-lg transition-shadow duration-300"
          >
            {renderPreview(thread)}
            <Link href={`/service/${serviceId}/${thread.id}`} target="_blank">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                  {thread.title}
                </h3>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <span>{formateTime(thread.xata.createdAt)}</span>
                <span className="mx-2">•</span>
                <span>{thread.replyCount} replies</span>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

```

### 然後在首頁引用他

修改你的首頁 也就是`src/app/page.tsx`

```tsx
import { Suspense } from "react";
import Link from "next/link";

import { getService } from "@/lib/database/service";
import { getThreadsWithReplyCount } from "@/lib/database/thread";
import { ThreadCarousel } from "@/components/homepage/ThreadCarousel";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { ProfileButton } from "@/components/service/ProfileButton";

export const revalidate = 1800;
const serviceIds = ["main"];

export default async function Home() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4 border-b">
        <Link href="/" passHref>
          <Button variant="link" className="text-2xl font-bold p-0">
            Akraft
          </Button>
        </Link>
        <nav className="flex items-center space-x-2">
          <Button variant="ghost">About</Button>
          <Button variant="outline" size="icon" asChild>
            <Link
              href="https://github.com/skynocover/akraft"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ProfileButton />
        </nav>
      </div>
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-4xl">Welcome to Akraft</CardTitle>
          <CardDescription className="text-xl">
            Create and explore your own discussion communities
          </CardDescription>
        </CardHeader>
      </Card>

      <div>
        <div className="space-y-6">
          {serviceIds.map(async (serviceId) => {
            const service = await getService({ serviceId });
            const threads = await getThreadsWithReplyCount({
              serviceId,
              pageSize: 8,
            });
            return (
              <Card key={serviceId} className="w-full">
                <CardHeader>
                  <Link
                    href={`/service/${serviceId}`}
                    target="_blank"
                    key={serviceId}
                  >
                    <CardTitle>{service?.name || "Loading..."}</CardTitle>
                  </Link>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="text-center py-4">
                        Loading latest threads...
                      </div>
                    }
                  >
                    <ThreadCarousel serviceId={serviceId} threads={threads} />
                  </Suspense>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

以及你的layout 也就是`src/app/layout.tsx`
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={inter.className}>
          <main className="flex-grow container ">{children}</main>
        </body>
      </SessionProvider>
    </html>
  );
}
```

然後你就可以在

```
http://localhost:3000/
```

看到你的最新的討論串了

你可以在

```
http://localhost:3000/service/main
```

的畫面中 多新增幾個討論串或回覆 看看首頁這裡會怎麼修改

## 觀念解釋

在`src/app/page.tsx`中 有一行
```ts
export const revalidate = 1800;
```

還記得我們在[第一堂課](https://ithelp.ithome.com.tw/articles/10345678)

裡面有提到Nextjs有一個特點是 `ISR / Incremental Static Regeneration`

他可以產生靜態檔案 並且在一定的時間內 重新製作靜態檔案

由於我們首頁並不需要很高的即時性

因此我們這邊設定ISR的時間間隔為1800秒 也就是每30分鐘會重新製作一次靜態檔案

這樣的設定可以減少每次讀取時 重新讀取DB的負擔

### 關於不同環境下的revalidate

- 開發環境（Development）:

在本地開發時(使用 next dev)，revalidate不會產生效果。
原因是在開發環境中，Next.js 會為每個請求重新渲染頁面，以便您可以立即看到更改。

- 生產環境（Production）:

revalidate 在生產環境中生效，但不僅限於 Vercel。
它可以在任何支持 Next.js 的生產環境中工作，包括自託管的服務器。


- Vercel 部署:

這個是我們之後會部署的地方 也就是Nextjs的官方服務

Vercel 為 Next.js 的 ISR（增量靜態再生）提供了優化的支持。
在 Vercel 上，revalidate 的行為可能更加高效和可靠。

## 總結

我們今天實作的首頁 以及解釋了ISR的觀念及做法



