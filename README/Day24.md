# Nextjs 的動態載入

## Suspense

你可能知道React的一個特性

```tsx
import { Suspense } from 'react';

function Page() {
  return (
    <>
      <h1>My Page</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </>
  );
}
```

目的是在component準備好之前 就讓前端用戶看到畫面
目的是增加使用者體驗 並讓用戶可以更快速看到頁面比較重要的內容

在Nextjs中 也有類似的東西 稱為dynamic

## Dynamic

增加一個檔案`src/components/commons/Suspense.tsx`

```tsx
import dynamic from "next/dynamic";
import { ServicesRecord } from "../../xata";

const DynamicComponent = dynamic(() => import("@/components/layout/Title"), {
  loading: () => <p>Loading dynamic component...</p>,
  ssr: false,
});

export default function DynamicImportExample({
  service,
}: {
  service: ServicesRecord;
}) {
  return (
    <div>
      <DynamicComponent service={service} />
    </div>
  );
}

```

並且在`src/app/service/[serviceId]/page.tsx`中引用他

```tsx
 <DynamicImportExample service={service} />
{/* <Title service={service} /> */}
```

然後重新整理畫面
你應該可以看到畫面上會有幾秒鐘的時間出現`Loading dynamic component...`的字

## 總結

在前幾天的`i18n`中你應該就看過類似的寫法了

```ts
const dictionaries = {
  en: () => import("./locales/en.json").then((module) => module.default),
  zh: () => import("./locales/zh.json").then((module) => module.default),
};
```

Nextjs的Dynamic跟React的Suspense的差別在於Nextjs會對Dynamic做優化
並且你可以明示的指定你要使用SSR還是CSR




