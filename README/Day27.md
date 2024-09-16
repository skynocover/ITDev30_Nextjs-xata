# Vercel的邊緣運算

最近Edge的runtime已經越來越流行了

Edge的目的是在離用戶最近的位置處理請求，優化效能和回應時間
它們特別適合處理需要快速回應的輕量級操作，如內容自訂、請求修改等

我們之前實作的Server Actions 則更專注於處理表單提交和資料變更等操作
它們在伺服器上運行，可以直接存取資料庫和其他伺服器資源

## Edge Functions

### 優勢

- 極低的延遲：由於運行在離用戶最近的位置，響應時間大大縮短
- 快速的冷啟動：相比傳統的無伺服器函數，Edge Functions 啟動更快
- 全球分佈：自動在全球範圍內分佈，無需額外配置

### 限制

- Edge Functions 有一些限制，例如不能使用 Node.js API，只能使用 Web API。
- 並非所有的 npm 套件都相容於 Edge runtime。
- 某些資料庫操作可能無法在 Edge 上執行
- 同時可以執行的時間也會被限制 (如果你的function會執行太久 則需要改成在server上執行)


### 不能使用的Node.js API

以下是一些沒辦法在Edge Function內執行的api

- global
- process

檔案
```ts
const fs = require('fs');
fs.readFileSync('some-file.txt');
```

子執行緒

```ts
const { exec } = require('child_process');
exec('ls -l', (error, stdout, stderr) => {
  console.log(stdout);
});
```

某些加密

```ts
const crypto = require('crypto');
const prime = crypto.generatePrimeSync(60);
```




## Nextjs的設定

如果你確定你的服務只需要Web API那你可以進行全域設定

> next.config.js 

```ts
module.exports = {
  experimental: {
    runtime: 'edge',
  },
};
```

如果你只需要在某一個api上指定的話
你可以在api上使用

```ts
export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  return new Response('Hello from the Edge!');
}
```

當然 你的Page也可以指定在edge上執行

```ts
// pages/edge-page.js
export const config = {
  runtime: 'edge',
};

export default function EdgePage({ data }) {
  return <div>{data}</div>;
}

export async function getServerSideProps(context) {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data },
  };
}
```

> middleware.ts

而我們的middleware則預設是在edge上執行

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  console.log({ session });

  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  const testGroup = Math.random() < 0.5 ? "A" : "B";
  const response = NextResponse.next();
  response.cookies.set("test_group", testGroup);

  // 繼續處理請求
  return response;
}

export const config = {
  matcher: "/:path*/about",
};
```

## Vercel的設定

當你上版之後 你也可以在Vercel上確認哪些是Edges上執行 哪些不是

1. 在Deployments內點選你需要的deploy


2. 然後點選Functions 這裡我們選擇middleware 就可以看到他的Runtime是Edge