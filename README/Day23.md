# SEO

既然服務都上線了 那我們來搞點SEO相關的設定吧

## Metadata

到`src/app/layout.tsx`

修改以下的程式碼
```ts
export const metadata: Metadata = {
  title: {
    default: "My Website",
    template: "%s | My Website",
  },
  description: "Welcome to my awesome website",
  keywords: ["Next.js", "React", "JavaScript"],
  authors: [{ name: "John" }],
  creator: "John",
  publisher: "John",
  formatDetection: {
    email: true,
    address: false,
    telephone: false,
  },
};
```

### title

標題是最重要的 SEO 元素之一。它告訴搜索引擎和用戶頁面的主題。

```
default: 'My Website'
```

這是網站的默認標題，當沒有特定頁面標題時使用。

```
template: '%s | My Website'
```

這是標題模板，%s 會被特定頁面的標題替換。
這讓每個頁面都有獨特而相關的標題，同時保持品牌一致性。

### description

'Welcome to my awesome website'

這個會出現在搜索結果頁面（SERP）的摘要中。
好的描述可以提高點擊率（CTR），間接影響排名。應該簡潔、準確地描述頁面內容。

### keywords: ['Next.js', 'React', 'JavaScript']

雖然現代搜索引擎不再重度依賴 meta keywords
但它們仍可能用於內部搜索或某些特定搜索引擎
所以我們還是補上一些

### authors: [{ name: 'John Doe' }]

authors有助於建立內容的可信度和作者權威性。
將影響 Google 的 E-A-T（專業性、權威性、可信度）評估。

### creator: 'John Doe'

這個類似於 authors，指明內容創建者。

### publisher: 'John Doe'

跟上面很像 只是指明發布實體，增加內容的可信度。
可能影響 E-A-T 評估，尤其是對新聞或專業內容網站。

### formatDetection

```json
{
  email: false,
  address: false,
  telephone: false,
}
```
這個不直接影響SEO 但是可能會影響使用者體驗

防止瀏覽器自動將文本格式化為可點擊的鏈接

這時候查看你的首頁 你應該可以看到你的瀏覽器的tab的名稱 變成了`My Website`

你可以嘗試修改metadata 然後看看會怎麼變化

## 其他頁面

### 其他頁面的metadata

來到 `src/app/[lang]/about/page.tsx`內
補上以下的程式碼

```tsx
import type { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> => {
  if (params.lang === "zh") {
    return {
      title: "關於我們",
    };
  }
  return {
    title: "About Us",
  };
};
```

這時候來到`http://localhost:3000/en/about`跟`http://localhost:3000/zh/about`

你應該可以看到兩種不同的title

### OpenGraph

OpenGraph的主要目的是優化網頁在社交媒體平台上的分享效果

它通過提供結構化的Metadata,讓社交媒體平台能更好地理解和展示您的網頁內容

當用戶在Facebook、X (Twitter)等平台分享網頁連結時
OpenGraph標籤可以控制顯示的標題、描述、圖片等內容, 使分享的內容更加吸引人點擊

修改你的`src/app/service/[serviceId]/[threadId]/page.tsx

```tsx
import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import Title from "@/components/layout/Title";
import ThreadComponent from "@/components/thread/ThreadComponent";

import { getService } from "@/lib/database/service";
import { getThread } from "@/lib/database/thread";

async function getThreadData(serviceId: string, threadId: string) {
  const thread = await getThread({ serviceId, threadId });
  return { thread };
}

export const generateMetadata = async ({
  params,
}: {
  params: { threadId: string; serviceId: string };
}): Promise<Metadata> => {
  const { thread } = await getThreadData(params.serviceId, params.threadId);
  return {
    openGraph: {
      title: thread?.title || "Thread Title",
      images: [
        {
          url: thread?.image || "",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
};

export default async function Page({
  params,
}: {
  params: { threadId: string; serviceId: string };
}) {
  const service = await getService({ serviceId: params.serviceId });
  if (!service) {
    return notFound();
  }

  const { thread } = await getThreadData(params.serviceId, params.threadId);

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

這裡我們將`getThreadData`這個function獨立出來

因為我們不希望在`generateMetadata`跟`Page`中都把`getThreadData`執行過一遍
將function放在這裡的話 
nextjs會因為我們在同一頁面重複調用相同程式碼的關係 
直接將結果從cache內拿出來用

## 部署你的服務

接下來 將最新版本推到github上面吧

確認部署完之後
我們可以來試看看我們的OpenGraph的效果

將你的討論串網址 例如
```
https://it-dev30-nextjs-xata.vercel.app/service/main/rec_crdvm55nrspomqjt8qfg
```

丟到以下的網址內
```
https://www.opengraph.xyz/
```

等他分析之後你就可以看到你的網站實際上分享到社群平台會長怎樣了

## 總結

今天我們實作了一些Nextjs上的SEO相關設定
並且使用工具查看了設定的結果
這些對於使用者來說都是比較友好的設定
