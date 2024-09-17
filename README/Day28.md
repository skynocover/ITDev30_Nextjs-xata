# Nextjs的錯誤處理

我們來接手Nextjs的錯誤處理吧

## 錯誤處理的component

我們在`src/components/layout/ErrorLogger.tsx`中建立一個ErrorLogger的component

```tsx
"use client";

import { useEffect } from "react";
import { useToast } from "@/components/hooks/use-toast";

export default function ErrorLogger() {
  const { toast } = useToast();

  const handleError = (message: string) => {
    const timestamp = new Date().toISOString();
    toast({
      variant: "destructive",
      title: "錯誤",
      description: `${message} (${timestamp})`,
    });
  };

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error);
      handleError(event.error.message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      handleError(event.reason.message);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return null;
}

```

他將會處理錯誤 並使用shadcn的toast來顯示錯誤訊息

## Error.tsx

Nextjs還有提供一個Error的處理方式

就是在同等級的頁面中 建立一個Error.tsx的頁面

例如我們在`src/app/error/error.tsx`中建立一個Error的頁面

```tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">出錯了！</h2>
      <p className="mb-4">{error.message}</p>
      <Button onClick={() => reset()}>重試</Button>
    </div>
  );
}

```

然後我們可以建立一個頁面來測試這個Error的頁面

在`src/app/error/page.tsx`中 建立檔案

```tsx
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ErrorTester: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);

  if (error) throw error;

  const triggerWindowError = () => {
    throw new Error("模擬的 window 錯誤");
  };

  const triggerUnhandledRejection = () => {
    Promise.reject(new Error("模擬的未處理 rejection"));
  };

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">錯誤測試器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={triggerWindowError}
        >
          觸發 Window 錯誤
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={triggerUnhandledRejection}
        >
          觸發未處理的 Promise 拒絕
        </Button>

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setError(new Error("手動觸發的錯誤"))}
        >
          觸發渲染中的錯誤
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorTester;

```

然後我們在全域的layout.tsx中 加入ErrorLogger的component

修改你的`src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "next-auth/react";
import ErrorLogger from "@/components/layout/ErrorLogger";

const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={inter.className}>
          <ErrorLogger />
          <main className="flex-grow container ">{children}</main>
        </body>
      </SessionProvider>
    </html>
  );
}
```

## 測試錯誤顯示

到`http://localhost:3000/error`這個頁面

你應該可以看到三個按鈕

按下上面兩個 可以看到錯誤被彈出

按最下面那個 會跳轉到Error的頁面

這邊可以看到錯誤的訊息 以及一個重試的按鈕

按下重試 會重新執行頁面

## 錯誤處理的差異

Nextjs提供的`error.tsx`只會攔截渲染時的錯誤

```tsx

  if (error) throw error; // 這個是渲染時的錯誤

  const triggerWindowError = () => {
    throw new Error("模擬的 window 錯誤"); // 這個不是渲染時的錯誤
  };

  const triggerUnhandledRejection = () => {
    Promise.reject(new Error("模擬的未處理 rejection")); // 這個不是渲染時的錯誤
  };
```

因此只有這個錯誤會被`error.tsx`攔截

