## 我們先來處理昨天的問題

昨天的問題來自前後端的時間渲染不一致

因此我們需要統一時間的作法

### 新增一個時間格式化的function

先安裝`dayjs`來處理時間

```
yarn add dayjs
```

接著在`src/lib/utils/timeformate.ts`新增一個時間格式化的function

```ts
import dayjs from "dayjs";

import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export const formateTime = (date: Date): string => {
  return dayjs(date).format("HH:mm:ss YYYY/MM/DD");
};

```

#### 然後修改`ThreadComponent.tsx`

```tsx
<span className="ml-auto flex items-center">
  {formateTime(thread.xata.createdAt)}
</span>
```

重新整理畫面你應該就可以注意到沒有Error了

## 我們繼續處理單一thread的頁面

如果你現在點擊Thread的標題
你會發現錯誤
因此我們要來修正

### 修改src/app/service/[serviceId]/[threadId]/page.tsx

```tsx
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
```

現在畫面應該正常了

## 我們現在要來處理reply的api

跟昨天一樣先建立api

### 建立src/app/service/[serviceId]/reply/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { XataClient } from "@/xata";
import { validatePostInput, extractYouTubeVideoId } from "@/lib/utils/threads";
import { fileToBase64, generateUserId } from "@/lib/utils/threads";

export const POST = async (req: NextRequest, context: any) => {
  const serviceId = context.params.serviceId;
  const xata = new XataClient({
    branch: serviceId,
    apiKey: process.env.XATA_API_KEY,
  });
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const threadId = formData.get("threadId") as string;
  const content = formData.get("content") as string;
  const youtubeLink = formData.get("youtubeLink") as string;
  const image = formData.get("image") as File | null;
  const sage = formData.get("sage") === "true";

  const input = {
    threadId,
    name,
    content,
    youtubeLink,
    image,
    sage,
  };

  const ip = req.ip || req.headers.get("X-Forwarded-For") || "unknown";
  const userId = generateUserId(ip);

  try {
    validatePostInput(input);

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID is required for replies" },
        { status: 400 }
      );
    }

    const reply = await xata.db.replies.create({
      thread: threadId,
      name: name.trim() || "anonymous",
      content,
      youtubeID: youtubeLink ? extractYouTubeVideoId(youtubeLink) : undefined,
      image: image
        ? {
            name: encodeURIComponent(image.name),
            mediaType: image.type,
            base64Content: await fileToBase64(image),
            enablePublicUrl: true,
          }
        : undefined,
      userId,
      userIp: ip,
    });

    // 如果sage是false，則更新thread的replyAt
    // 目的是將thread推文到最前面
    if (!sage) {
      await xata.db.threads.update(threadId, { replyAt: new Date() });
    }

    return NextResponse.json({
      message: "Reply created successfully",
      reply,
    });
  } catch (error) {
    console.error("Reply creation error:", error);
    return NextResponse.json(
      { error: "Reply creation failed: " + error },
      { status: 500 }
    );
  }
};
```

這時候你應該可以點擊thread標題旁邊的氣泡來回應thread了

## 處理檔案上傳

現在嘗試看看上傳檔案
然後你應該會發現錯誤

這是由於SSR傳遞資訊到CSR時 只能傳遞簡單的json 但是由於我們剛剛上傳的檔案

因此
```tsx
<MediaContent
  imageURL={thread.image?.url}
  youtubeID={thread.youtubeID || ""}
/>
```

這裡出錯了
你可以將滑鼠移到image上 你會發現它是一個`XataFile`的class
他有自己的method

### 因此我們要來扁平化thread的資料

我們先來修改`src/lib/database/thread.ts`

```tsx
// 修改type
// 將原本type內的image移除
type WithoutImage<T> = Omit<T, "image">;

export type ThreadWithReplies = WithoutImage<ThreadsRecord> & {
  image?: string; // 移除後換成單純的string
  replies: (WithoutImage<RepliesRecord> & {
    image?: string; // 移除後換成單純的string
    threadId: string;
  })[];
};

// 修改Promise.all內的作法
const threadsWithReplies: ThreadWithReplies[] = await Promise.all(
  threads.map(async (thread) => {
    const replies = await xata.db.replies
      .filter({ thread: thread.id })
      .getAll();

    const transformedReplies = replies.map((reply) => ({
      ...reply,
      thread: undefined,
      threadId: thread.id,
      image: reply.image?.url, // 移除後換成單純的string
    }));

    return {
      ...thread,
      replies: transformedReplies,
      image: thread.image?.url, // 移除後換成單純的string
    };
  })
);
```

接著修改`src/components/thread/ThreadComponent.tsx`

將原本的image.url改成image

```tsx
<MediaContent
  imageURL={thread.image}
  youtubeID={thread.youtubeID || ""}
/>
```

這樣重新整理畫面你應該就可以看到剛剛上傳的檔案了

## 總結

**為什麼Nextjs明明是SSR 卻會遇到跟CSR時間格式不一致的問題?**

Nextjs有一個觀念叫`Hydration`

在這個過程中,客戶端的 JavaScript 會接管頁面的交互性

```ts
// 服務器端（Node.js）
console.log(new Date().toLocaleString()); // 輸出: 2024/9/1 12:00:00

// 客戶端（瀏覽器）
console.log(new Date().toLocaleString()); // 輸出: 2024年9月1日 12:00:00
```

這是因為Nodejs跟瀏覽器在不同環境下可能會有不同的默認行為

你也可以用以下的方是 修改他們的默認行為
```ts
const options = { 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit',
  hour12: false,
  timeZone: 'Asia/Taipei'
};

console.log(new Date().toLocaleString('zh-CN', options));
```

不過我這裡直接改用dayjs來處理時間格式化

**為什麼Nextjs中 SSR傳遞資訊給CSR時 只能傳遞plain object?**

這是因為在Nextjs中 當你從服務器端（SSR）向客戶端（CSR）傳遞資訊時
默認情況下，資訊會被序列化為字串 (使用JSON.stringify)
這是為了確保資訊在不同環境中都能被正確解析。

然而，某些資訊（如Date對象）在序列化過程中可能會丟失其特定類型信息，導致在客戶端無法正確識別和處理
因此，Nextjs建議在傳遞資訊時，只傳遞plain object，這樣可以避免這些問題。

包括我們今天修正的thread.image也一樣
