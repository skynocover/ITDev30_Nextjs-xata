## 優化一些機制

現在你的版面應該可以算是初步完成了

現在我們來優化一些機制

例如讓用戶可以回報版面上的一些鬧版

### 新增回報的table

修改你的schema.json

新增下面的table

```json
{
  "name": "reports",
  "columns": [
    { "name": "content", "type": "text" },
    { "name": "thread", "type": "link", "link": { "table": "threads" } },
    { "name": "reply", "type": "link", "link": { "table": "replies" } },
    { "name": "userIp", "type": "string" },
    { "name": "reportedIp", "type": "string" }
  ]
}
```

然後同樣使用`xata:upload`及`xata:gen`來更新你的schema

```
pnpm run xata:upload
pnpm run xata:gen
```

### 然後新增回報的api

新增`src/app/api/service/[serviceId]/reports/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

import { XataClient } from "@/xata";
import { NextAuthRequest } from "@/auth";
import {
  withServiceOwnerCheck,
  ServiceOwnerContext,
} from "@/lib/middleware/serviceOwnerCheck";

const _get = async (req: NextAuthRequest, context: ServiceOwnerContext) => {
  try {
    const reports = await context.xata.db.reports.getAll();
    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Fetching reports error:", error);
    return NextResponse.json(
      { error: "Fetching reports failed: " + error.message },
      { status: 500 }
    );
  }
};

// 只有owner可以讀取report
export const GET = withServiceOwnerCheck(_get);

export async function POST(
  req: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const serviceId = params.serviceId;
    const data = await req.json();

    const userIp = req.ip || req.headers.get("X-Forwarded-For") || "unknown";
    const threadId = data.threadId as string | undefined;
    const replyId = data.replyId as string | undefined;
    const content = data.content as string | undefined;
    const reportedIp = data.reportedIp as string | undefined;

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });

    await xata.db.reports.create({
      thread: threadId,
      reply: replyId,
      content,
      userIp,
      reportedIp,
    });

    return NextResponse.json({
      message: "Report created successfully",
    });
  } catch (error: any) {
    console.error("Report creation error:", error);
    return NextResponse.json(
      { error: "Report creation failed: " + error.message },
      { status: 500 }
    );
  }
}

const _delete = async (req: NextAuthRequest, context: ServiceOwnerContext) => {
  try {
    const { xata } = context;

    const body = await req.json();
    const { reportIds, deleteAssociated = false } = body;

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: "Report IDs are required" },
        { status: 400 }
      );
    }

    // Delete all associated replies
    if (deleteAssociated) {
      // Fetch all reports to be deleted
      const reportsToDelete = (await xata.db.reports.read(reportIds)).filter(
        (item) => !!item
      );

      for (const report of reportsToDelete) {
        if (report.reply && report.thread) {
          // Case: Deleting a reply
          await xata.db.replies.delete(report.reply.id);
        } else if (report.thread && !report.reply) {
          // Case: Deleting a thread
          const relatedReplies = await xata.db.replies
            .filter({ thread: report.thread.id })
            .getAll();
          await xata.db.replies.delete(relatedReplies.map((reply) => reply.id));

          // Delete all associated reports
          const relatedReports = await xata.db.reports
            .filter({ thread: report.thread.id })
            .getAll();
          await xata.db.reports.delete(relatedReports.map((r) => r.id));

          // Delete the thread
          await xata.db.threads.delete(report.thread.id);
        }
      }
    }

    await xata.db.reports.delete(reportIds);

    return NextResponse.json({
      message: "Reports and associated content deleted successfully",
    });
  } catch (error: any) {
    console.error("Reports deletion error:", error);
    return NextResponse.json(
      { error: "Reports deletion failed: " + error.message },
      { status: 500 }
    );
  }
};

// 只有owner可以刪除report
export const DELETE = withServiceOwnerCheck(_delete);

```

### 然後修改畫面 讓使用者可以回報鬧版

先安裝今天會用到的ui

```
npx shadcn@latest add dialog 
```

然後新增`src/components/thread/ReportButton.tsx`

```tsx
"use client";
import React, { useState } from "react";

import { Flag } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ReportModalProps {
  serviceId: string;
  reportedIp: string;
  threadId?: string;
  replyId?: string;
}

export const ReportButton: React.FC<ReportModalProps> = ({
  serviceId,
  reportedIp,
  threadId,
  replyId,
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>("");

  const onReport = async (content: string) => {
    try {
      await axios.post(`/api/service/${serviceId}/reports`, {
        content,
        threadId,
        replyId,
        reportedIp,
      });
    } catch (error) {
      console.error("Failed to report post:", error);
    }
  };

  const handleReport = () => {
    onReport(reportReason);
    handleClose();
  };

  const handleClose = () => {
    setReportReason("");
    setIsReportModalOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="ml-1 h-6 w-6"
        onClick={() => setIsReportModalOpen(true)}
        title="Report this post"
      >
        <Flag className="h-4 w-4" color="red" />
      </Button>

      <Dialog open={isReportModalOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter reason for reporting"
            value={reportReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setReportReason(e.target.value)
            }
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              onClick={() => setIsReportModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleReport} disabled={!reportReason}>
              Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

```

並修改`src/components/thread/ThreadComponents.tsx`

在thread.id後面新增一個回報的按鈕
```tsx
<span className="text-blue-300 ml-1">No: {thread.id}</span>
<ReportButton
  serviceId={serviceId}
  threadId={thread.id}
  reportedIp={thread.userIp || ""}
/>
```

在reply.id後面新增一個回報的按鈕

```tsx
<span className="text-blue-300 ml-1">No: {reply.id}</span>
<ReportButton
  serviceId={serviceId}
  threadId={thread.id}
  replyId={reply.id}
  reportedIp={reply.userIp || ""}
/>
```

然後你就可以看到每一個number旁邊都有一個回報的按鈕了

點擊之後 可以讓用戶自行輸入要回報的內容

然後你就可以在Xata內看到使用者的回報了

## 總結

今天我們新增了回報的機制

並增加了shadcn的ui的dialog來做回報的彈窗

明天我們在Dashboard實作查看回報的畫面