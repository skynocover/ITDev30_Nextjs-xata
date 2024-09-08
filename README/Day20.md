## i18n

### 先安裝今天會用到的套件

```
pnpm dlx shadcn@latest add select
```

```
 pnpm install @formatjs/intl-localematcher negotiator
```

```
pnpm install -D @types/negotiator   
```

### 然後建立語言選擇器

建立檔案`src/components/commons/LanguageSwitcher.tsx`

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function LanguageSwitcher({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    const newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <div>
      <Select
        defaultValue={lang}
        onValueChange={(value) => switchLanguage(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="zh">中文</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### 之後建立我們的語言檔案

在`src/app/[lang]/about`建立`locales`資料夾

建立`src/app/[lang]/about/locales/en.json`

```json
{
  "hello": "Hello",
  "welcome": "Welcome to our about page"
}
```

建立`src/app/[lang]/about/locales/zh.json`

```json
{
  "hello": "你好",
  "welcome": "歡迎來到我們的關於頁面"
}
```

### 建立 getDictionary 函數


建立`src/app/[lang]/about/getDictionary.ts`

```ts
import "server-only";

const dictionaries = {
  en: () => import("./locales/en.json").then((module) => module.default),
  zh: () => import("./locales/zh.json").then((module) => module.default),
};

export const getDictionary = async (locale: "en" | "zh") =>
  dictionaries[locale]();
```

### 然後建立畫面

建立`src/app/[lang]/about/page.tsx`

```tsx
import { getDictionary } from "./getDictionary";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "@/components/commons/LanguageSwitcher";

export default async function Home({ params }: { params: { lang: string } }) {
  if (params.lang !== "en" && params.lang !== "zh") {
    notFound();
  }
  const dictionary = await getDictionary(params.lang);
  return (
    <div className="container mx-auto mt-10">
      <div className="flex justify-end mb-4">
        <LanguageSwitcher lang={params.lang} />
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {dictionary.hello}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg">{dictionary.welcome}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

然後你應該就可以看到畫面了

選擇右上角的語言 然後看網址及畫面如何變化

## 觀念解釋

我們的locales資料夾不放在public有以下幾個原因

- 安全性：src 目錄中的文件不會直接暴露給客戶端，而 public 目錄中的文件可以被直接訪問。
- 編譯優化：放在 src 中的文件可以被構建工具處理，可能進行壓縮、優化等操作。
- 類型檢查：如果使用 TypeScript，放在 src 中可以更好地進行類型檢查和推斷。

你可以在page.tsx中 使用`dictionary.`來看有哪些key可以用

## 總結

Nextjs的i18n作法改過很多次
所以如果你上網查的話應該會看到很多種不同的程式碼

如果你需要用到的話
記得加上`nextjs14` 跟 `app route`這些關鍵字

這樣你比較容易找到你想要的資訊