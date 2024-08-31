## 我們接下來要串接新增及讀取Thread

## Nextjs的api

### 建立Nextjs的api

在src/app/api/service/[serviceId]/thread/route.ts中 建立以下的檔案

```ts
import { NextRequest, NextResponse } from "next/server";
import {
  validatePostInput,
  extractYouTubeVideoId,
  fileToBase64,
  generateUserId,
} from "@/lib/utils/threads";
import { XataClient } from "@/xata";

export const POST = async (req: NextRequest, context: any) => {
  const serviceId = context.params.serviceId;
  const xata = new XataClient({
    branch: serviceId,
    apiKey: process.env.XATA_API_KEY,
  });

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const youtubeLink = formData.get("youtubeLink") as string;
  const image = formData.get("image") as File | null;
  const input = {
    title,
    name,
    content,
    youtubeLink: youtubeLink,
    image,
  };

  // vercel 需要使用 req.headers.get("X-Forwarded-For") 取得真實IP
  const ip = req.ip || req.headers.get("X-Forwarded-For") || "unknown";

  const userId = generateUserId(ip);

  try {
    validatePostInput(input);

    const thread = await xata.db.threads.create({
      title: title.trim() || "Untitled",
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
      replyAt: new Date(),
      userId,
      userIp: ip,
    });
    return NextResponse.json({
      message: "Thread created successfully",
      thread,
    });
  } catch (error) {
    console.error("Thread creation error:", error);
    return NextResponse.json(
      { error: "Thread creation failed" + error },
      { status: 500 }
    );
  }
};
```

### 補上兩個function

修改你的src/lib/utils/threads.ts

```ts
import crypto from "crypto"; //新增這個import

// 新增兩個function
export const fileToBase64 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const base64String = Buffer.from(buffer).toString("base64");
  return base64String;
};

export const generateUserId = (ip: string): string => {
  const key =
    process.env.USER_ID_SECRET_KEY ||
    "ccf721ebbbfd4aabfb0c101ae1df46a585c945b75ecf92640807cab55902c858";
  const hash = crypto.createHash("sha256");
  hash.update(ip + key);
  return hash.digest("hex").substring(0, 13);
};

```

### 串接api

首首先我們需要先安裝axios

```bash
yarn add axios
```

在src/components/thread/PostCard.tsx中 串接api

```ts
"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  Upload,
  Link,
  Eye,
  EyeOff,
  Loader,
  X,
  MessageCircle,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { validatePostInput, PostInput } from "@/lib/utils/threads";

import { PostContent } from "./PostContent";

interface PostCardProps {
  serviceId: string;
  description?: string;
  threadId?: string;
  onClose?: () => void;
}

export default function PostCard({
  serviceId,
  description,
  threadId,
  onClose,
}: PostCardProps) {
  const isReply = !!onClose;
  const fileInputID = `dropzone-file-${isReply ? `${threadId}-reply` : "page"}`;
  const [markdownInfo, setMarkdownInfo] = useState("");
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSage, setIsSage] = useState(false);
  const router = useRouter();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownInfo(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("content", markdownInfo);

      if (isReply) {
        if (!threadId) throw new Error("Thread ID is required for replies");
        const replyInput: PostInput = {
          threadId,
          name,
          content: markdownInfo,
          youtubeLink,
          image: file,
        };
        validatePostInput(replyInput);
        formData.append("threadId", threadId);
        formData.append("sage", isSage.toString());
      } else {
        const postInput: PostInput = {
          title,
          name,
          content: markdownInfo,
          youtubeLink,
          image: file,
        };
        validatePostInput(postInput);
        formData.append("title", title);
      }

      if (youtubeLink?.trim()) {
        formData.append("youtubeLink", youtubeLink.trim());
      }

      if (file) {
        formData.append("image", file);
      }

      // 這裏串接我們剛剛做好的api
      await axios.post(
        isReply
          ? `/api/service/${serviceId}/reply`
          : `/api/service/${serviceId}/thread`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Reset form fields
      setTitle("");
      setName("");
      setMarkdownInfo("");
      setYoutubeLink("");
      setFile(null);

      // Close modal if it's a reply, otherwise refresh the page
      if (isReply && onClose) {
        onClose();
      }
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`mb-4 shadow-md ${
        isReply ? "w-full max-w-md mx-auto" : "mx-auto max-w-3xl"
      }`}
    >
      <CardContent className="p-3 relative">
        {isReply && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <form className="space-y-2" onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            {!isReply && (
              <Input
                placeholder="Title"
                className="text-base"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
            )}
            <Input
              placeholder="Name"
              className="text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPreview((prev) => !prev)}
              className="absolute top-2 right-2 z-10 flex items-center"
              disabled={isLoading}
            >
              {isPreview ? (
                <EyeOff className="w-4 h-4 m-2" />
              ) : (
                <Eye className="w-4 h-4 m-2" />
              )}
            </Button>

            {isPreview ? (
              <div className="min-h-40">
                <PostContent content={markdownInfo} />
              </div>
            ) : (
              <Textarea
                placeholder="Content"
                className="h-40 text-sm border"
                value={markdownInfo}
                onChange={handleContentChange}
                disabled={isLoading}
              />
            )}
          </div>

          <Tabs defaultValue="image">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="image" disabled={isLoading}>
                Upload
              </TabsTrigger>
              <TabsTrigger value="youtube" disabled={isLoading}>
                YouTube
              </TabsTrigger>
            </TabsList>
            <TabsContent value="youtube">
              <div className="flex items-center">
                <Link className="mr-2" />
                <Input
                  placeholder="YouTube Link"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </TabsContent>
            <TabsContent value="image">
              <div className="flex items-center justify-center w-full h-28 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                <label
                  htmlFor={fileInputID}
                  className="flex flex-col items-center justify-center w-full h-full"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">
                    {file ? file.name : "Click or drag to upload image"}
                  </p>
                  <input
                    id={fileInputID}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    accept="image/*"
                  />
                </label>
              </div>
            </TabsContent>
          </Tabs>

          {!isReply && description && (
            <Markdown
              className="text-sm text-gray-500 whitespace-pre-wrap"
              remarkPlugins={[remarkGfm]}
            >
              {description}
            </Markdown>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex">
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : isReply ? (
                "Submit reply"
              ) : (
                "Submit"
              )}
            </Button>
            {isReply && (
              <div className="flex items-center space-x-2 ml-2">
                <Checkbox
                  id="sage"
                  checked={isSage}
                  onCheckedChange={(checked) => setIsSage(checked as boolean)}
                />
                <label
                  htmlFor="sage"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sage
                </label>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface IReplyModal {
  threadId: string;
  serviceId: string;
}

export const ReplyButton: React.FC<IReplyModal> = ({ threadId, serviceId }) => {
  const [showReplyModal, setShowReplyModal] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="mb-1"
        onClick={() => setShowReplyModal(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md">
            <PostCard
              serviceId={serviceId}
              threadId={threadId}
              onClose={() => setShowReplyModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

```

### 觀念解釋

- 檔案路徑中 Nextjs的api應該要放在app這個資料夾下中的api資料夾內
  - 這樣的寫法是為了讓Nextjs知道這是一個api的檔案
  - [serviceId] 是動態路由的寫法，可以讓我們在不同的serviceId下使用相同的api
  - route.ts 是路由的寫法，可以讓我們在不同的路徑下使用相同的api
- route.ts 中的 POST 是 HTTP 方法的寫法，可以讓我們在不同的 HTTP 方法下使用相同的 api
  - 動態路由可以經由context.params.serviceId取得serviceId
- xata中 我們使用xata.db.threads.create來新增一個thread
  - 新增image時 我們使用`base64Content: await fileToBase64(image)` 來新增一張圖片
    - 並使用`enablePublicUrl: true` 來讓圖片可以被公開
  - 新增youtube時 我們使用`youtubeID: extractYouTubeVideoId(youtubeLink)` 來新增一個youtube的連結
  - 新增userId時 我們使用`userId: generateUserId(ip)` 來新增一個userId 目的是讓每一個IP都有一個ID 方便確認發文的人
  
## 建立讀取的function

在src/lib/database/thread.ts中 建立以下的檔案

```ts
import { XataClient, ThreadsRecord, RepliesRecord } from "../../xata";

export type ThreadWithReplies = ThreadsRecord & {
  replies: RepliesRecord[];
};

interface IGetThreads {
  serviceId: string;
  page?: number;
  pageSize?: number;
}

export const getThreads = async ({
  serviceId,
  page = 1,
  pageSize = 10,
}: IGetThreads): Promise<{
  threads: ThreadWithReplies[];
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });

    const offset = (page - 1) * pageSize;

    const [{ records: threads }, totalRecords] = await Promise.all([
      xata.db.threads.sort("replyAt", "desc").getPaginated({
        pagination: {
          size: pageSize,
          offset: offset,
        },
      }),
      xata.db.threads.aggregate({
        totalRecords: {
          count: "*",
        },
      }),
    ]);

    const threadsWithReplies: ThreadWithReplies[] = await Promise.all(
      threads.map(async (thread) => {
        const replies = await xata.db.replies
          .filter({ thread: thread.id })
          .getAll();

        const transformedReplies = replies.map((reply) => ({
          ...reply,
          thread: undefined,
        }));

        return {
          ...thread,
          replies: transformedReplies,
        };
      })
    );

    const totalPages = Math.ceil(totalRecords.aggs.totalRecords / pageSize);

    return {
      threads: threadsWithReplies,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error(error);
    return {
      threads: [],
      totalPages: 0,
      currentPage: page,
    };
  }
};

export const getThread = async ({
  serviceId,
  threadId,
}: {
  serviceId: string;
  threadId: string;
}): Promise<ThreadWithReplies | null> => {
  try {
    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });

    // Fetch the specific thread
    const thread = await xata.db.threads.read(threadId);
    if (!thread) {
      throw new Error(`Thread with id ${threadId} not found`);
    }

    // Fetch related replies for the thread
    const replies = await xata.db.replies
      .filter({ "thread.id": threadId })
      .getAll();

    // Combine thread and replies
    const threadWithReplies: ThreadWithReplies = {
      ...thread,
      replies,
    };

    return threadWithReplies;
  } catch (error) {
    console.error("Error fetching thread with replies:", error);
    return null;
  }
};

```

### 修改畫面 

首先是 src/app/service/[serviceId]/page.tsx 中 我們需要新增getThreads

```ts
import React from "react";
import ThreadComponent from "@/components/thread/ThreadComponent";
import Title from "@/components/layout/Title";

import PostCard from "@/components/thread/PostCard";
import { getService } from "@/lib/database/service";
import { getThreads } from "@/lib/database/thread";
import { notFound } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: { serviceId: string };
  searchParams: { page?: string };
}) {
  // 這裏的page先準備好 之後會用到
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 10;

  const service = await getService({ serviceId: params.serviceId });
  if (!service) {
    return notFound();
  }

  // 這裏我們會使用剛才的function來取得threads
  const { threads, totalPages } = await getThreads({
    serviceId: params.serviceId,
    page: currentPage,
    pageSize,
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      <Title service={service} />
      <PostCard
        serviceId={params.serviceId}
        description={service.description || ""}
      />

      {threads.map((thread) => (
        <ThreadComponent
          key={thread.id}
          serviceId={params.serviceId}
          thread={thread}
        />
      ))}
    </div>
  );
}

```

### 相對應的ThreadComponent.tsx也需要修改

```ts
"use client";
import React, { useState } from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ReplyButton } from "./PostCard";
import { ThreadWithReplies } from "@/lib/database/thread";

export interface IReply {
  id: string;
  name: string;
  content?: string;
  image?: string;
  youtubeID?: string;
  userId: string;
  createdAt: string;
}

interface ThreadComponentProps {
  serviceId: string;
  thread: ThreadWithReplies;
  isPage?: boolean;
}

export const MediaContent: React.FC<{
  imageURL: string | undefined;
  youtubeID: string | undefined;
}> = ({ imageURL, youtubeID }) => {
  if (imageURL) {
    return (
      <div>
        <img
          src={imageURL}
          className="w-full h-full max-w-full max-h-[400px] object-contain cursor-pointer"
        />
      </div>
    );
  }
  if (youtubeID) {
    return (
      <div className="relative w-full pt-[56.25%]">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeID}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg"
        ></iframe>
      </div>
    );
  }
  return null;
};

const ThreadComponent: React.FC<ThreadComponentProps> = ({
  thread,
  serviceId,
  isPage = false,
}) => {
  const [showAllReplies, setShowAllReplies] = useState(false);
  const visibleRepliesNum = 2;
  const visibleReplies =
    !isPage && !showAllReplies
      ? thread.replies.slice(-visibleRepliesNum)
      : thread.replies;

  return (
    <Card
      id={thread.id}
      className={
        "mb-6 overflow-hidden scroll-mt-20 transition-all duration-300"
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-center">
          <CardTitle className={"text-2xl font-bold text-center"}>
            {isPage ? (
              <> {thread.title}</>
            ) : (
              <Link
                href={`/service/${serviceId}/${thread.id}`}
                className="hover:underline"
              >
                {thread.title}
              </Link>
            )}
          </CardTitle>
          <ReplyButton serviceId={serviceId} threadId={thread.id} />
        </div>

        <div
          className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
          id={thread.id}
        >
          <span className="font-semibold text-gray-700">{thread.name}</span>
          <span>ID: {thread.userId}</span>
          <span className="ml-auto flex items-center">
            {thread.xata.createdAt.toLocaleString()}
          </span>
          <span className="text-blue-300 ml-1">No: {thread.id}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex flex-col md:flex-row md:space-x-4">
          {thread.image || thread.youtubeID ? (
            <>
              <div className="w-full md:w-1/2 mb-4 md:mb-0 h-auto">
                <MediaContent
                  imageURL={thread.image?.url}
                  youtubeID={thread.youtubeID || ""}
                />
              </div>
              <div className="w-full md:w-1/2">{thread.content}</div>
            </>
          ) : (
            <div className="w-full md:w-1/2 mx-auto">{thread.content}</div>
          )}
        </div>
      </CardContent>
      {thread.replies.length > 0 && (
        <CardFooter className="flex flex-col pt-4">
          <Separator className="mb-4" />
          {!isPage && thread.replies.length > visibleRepliesNum && (
            <Button
              variant="outline"
              onClick={() => setShowAllReplies(!showAllReplies)}
              className="w-full mb-4"
            >
              {showAllReplies ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" /> Hide Replies
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" /> Show All{" "}
                  {thread.replies.length} Replies
                </>
              )}
            </Button>
          )}
          <div className="space-y-4 w-full">
            {visibleReplies.map((reply, index) => (
              <div key={reply.id} className={"mt-4 scroll-mt-20 $"}>
                {index > 0 && <Separator />}
                <div>
                  <div
                    className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
                    id={reply.id}
                  >
                    <span className="font-semibold text-gray-700">
                      {reply.name}
                    </span>
                    <span>ID: {reply.userId}</span>
                    <span className="ml-auto flex items-center">
                      {reply.xata.createdAt.toLocaleString()}
                    </span>
                    <span className="text-blue-300 ml-1">No: {reply.id}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-col md:flex-row md:space-x-4">
                      {reply.image || reply.youtubeID ? (
                        <>
                          <div className="w-full md:w-1/2 mb-4 md:mb-0 h-auto">
                            <MediaContent
                              imageURL={reply.image?.url}
                              youtubeID={reply.youtubeID || ""}
                            />
                          </div>
                          <div className="w-full md:w-1/2">{reply.content}</div>
                        </>
                      ) : (
                        <div className="w-full md:w-1/2 mx-auto">
                          {reply.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ThreadComponent;

```

### 觀念解釋

在route.ts中

```ts
const [{ records: threads }, totalRecords] = await Promise.all([
  xata.db.threads.sort("replyAt", "desc").getPaginated({
    pagination: {
        size: pageSize,
        offset: offset,
      },
    }),
    xata.db.threads.aggregate({
      totalRecords: {
      count: "*",
    },
  }),
]);

const threadsWithReplies: ThreadWithReplies[] = await Promise.all(
  threads.map(async (thread) => {
    const replies = await xata.db.replies
      .filter({ thread: thread.id })
      .getAll();

    const transformedReplies = replies.map((reply) => ({
      ...reply,
      thread: undefined,
    }));

    return {
      ...thread,
      replies: transformedReplies,
    };
  })
);

const totalPages = Math.ceil(totalRecords.aggs.totalRecords / pageSize);
```

- 我們使用`sort("replyAt", "desc")`來排序 並且使用`getPaginated`來取得分頁的資料
- 針對threads使用Promise.All來取得所有thread的reply
- 使用totalPages來取得總共有多少頁

## 使用剛剛建立的畫面吧

開啟你的
```
http://localhost:3000/service/main
```

在PostCard內輸入一些內容 按下Submit 就可以看到你剛才打的內容了

畫面左下角會有錯誤

不過不用擔心 我們明天會修正他

## 總結

- 我們在route.ts中新增了POST的function
- 在thread.ts中新增了getThreads 跟 getThread的function
- 在page.tsx 跟 ThreadComponent.tsx中使用了getThreads 跟 getThread的function

今天就到這邊 明天我們會修正畫面上的錯誤
