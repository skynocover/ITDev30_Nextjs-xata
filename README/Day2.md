## Day2

### 安裝Nextjs

```
npx create-next-app@latest
```

選項全部選預設就好

### 啟動Nextjs

```
yarn dev
```

並且在你的瀏覽器打開

```
http://localhost:3000/
```
應該就可以看到畫面了

你看到的畫面的程式碼會在src/app/page.tsx內

你可以隨意改動這個檔案的程式碼  
然後看畫面會如何更改  
不用擔心改壞
因為我們之後會換掉他

### 資料夾結構

Nextjs使用基於檔案路徑的路由  
我們希望我們的討論版路徑為
> http://localhost:3000/servcie/[serviceId]

serviceId指向不同的討論版

因此我們需要建立一個路徑為
> src/app/service/[serviceId]/page.tsx

的檔案 
 
注意資料夾名稱**直接是[serviceId]**

page.tsx的檔案內容為
```tsx
import React from "react";

export default async function Page({
  params,
}: {
  params: { serviceId: string };
}) {
  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      {params.serviceId}
    </div>
  );
}
```

建立好並存擋之後進到你的
```
http://localhost:3000/service/test
```
你就可以看到畫面了

你可以隨意修改test成別的  
看看他會變成怎樣

**為什麼**

資料夾名稱[serviceId]表示他是動態路由  
可以經由params.serviceId取得

page.tsx則表示根目錄

因此
```
/src/app/service/[serviceId]/page.tsx
```
會對應到
```
/service/[serviceId]
```

詳細你可以看[這裏](https://nextjs.org/docs/app/building-your-application/routing/defining-routes)

## 總結

你可以嘗試在不同路徑下建立不同檔案  
然後看看會對應到什麼網址

今天先到這邊  
明天開始我們來刻畫面
