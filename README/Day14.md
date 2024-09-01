## 我們今天要來實作修改Service的api

### 先實作驗證使用者登入身份的middleware

建立`src/lib/middleware/serviceOwnerCheck.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { auth } from "@/auth";

import { XataClient, ServicesRecord } from "@/xata";

export interface NextAuthRequest extends NextRequest {
  auth: Session | null;
}

export const handleRole = (handler: Function) => {
  return auth(async (req: NextAuthRequest, context: any) => {
    const serviceId = context.params.serviceId;
    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });
    const service = await xata.db.services.getFirst();
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    const isOwner = req.auth?.user?.id === "admin";
    return handler(req, { ...context, xata, service, isOwner });
  });
};

export interface ServiceRoleContext {
  xata: XataClient;
  service: ServicesRecord;
  isOwner: boolean;
}

export const withServiceOwnerCheck = (handler: Function) => {
  return handleRole(
    async (req: NextAuthRequest, context: ServiceRoleContext) => {
      if (!context.isOwner) {
        return NextResponse.json(
          { error: "You are not owner of service" },
          { status: 403 }
        );
      }
      return handler(req, context);
    }
  );
};

export type ServiceOwnerContext = ServiceRoleContext;

```
### 實作修改Service的api


在你的`src/app/api/service/[serviceId]/route.ts`中，我們需要實作`PUT`的api，用來修改service的資料

```ts
import { NextResponse } from "next/server";
import { ILinkItem } from "@/components/layout/Title";
import { NextAuthRequest } from "@/auth";
import {
  withServiceOwnerCheck,
  ServiceOwnerContext,
} from "@/lib/middleware/serviceOwnerCheck";

const put = async (req: NextAuthRequest, context: ServiceOwnerContext) => {
  try {
    const { xata, service } = context;

    const data = await req.json();
    const name = data.name as string;
    const description = data.description as string;
    const topLinks = data.topLinks as ILinkItem;
    const headLinks = data.headLinks as ILinkItem;

    await xata.db.services.update(service.id, {
      name: name.trim(),
      description,
      topLinks: topLinks || [],
      headLinks: headLinks || [],
    });

    return NextResponse.json({
      message: "Service updated successfully",
    });
  } catch (error: any) {
    console.error("Service update error:", error);
    return NextResponse.json(
      { error: "Service update failed: " + error.message },
      { status: 500 }
    );
  }
};

export const PUT = withServiceOwnerCheck(put);
```

然後 你就可以在

```
http://localhost:3000/dashboard/main
```

中更新service的資料了

修改之後 你可以到

```
http://localhost:3000/service/main
```

這裡去看你剛剛修改的資料是否已經正確的被顯示出來

## 觀念解釋

今天的實作中

我們實作了兩個middleware

1. `handleRole`
2. `withServiceOwnerCheck`

### handleRole

我們這裡會實作一個XataClient的實體
並確認service是否存在
以及登入的人是否為admin

```ts
const xata = new XataClient({
  branch: serviceId,
  apiKey: process.env.XATA_API_KEY,
});

const service = await xata.db.services.getFirst();
if (!service) {
  return NextResponse.json({ error: "Service not found" }, { status: 404 });
}
const isOwner = req.auth?.user?.id === "admin";
```

並且定義了context的型別
```ts
export interface ServiceRoleContext {
  xata: XataClient;
  service: ServicesRecord;
  isOwner: boolean;
}
```

這樣在`withServiceOwnerCheck`中 我們就可以使用這個context了

```ts
async (req: NextAuthRequest, context: ServiceRoleContext) => {
  if (!context.isOwner) { // 如果使用者不是owner 回傳403
    return NextResponse.json(
      { error: "You are not owner of service" },
      { status: 403 }
    );
  }
  return handler(req, context);
}
```

而由於我們已經在middleware中實作過xataclient了

因此在我們的api中 就可以直接拿出來用

```ts
const { xata, service } = context;
```

明天我們繼續優化一些小功能

