# Post頁面

## 先安裝今天會用到的套件

```
yarn add react-markdown remark-gfm 
```

```
npx shadcn-ui@latest add input textarea tabs alert checkbox 
```

## 定義型別與檢查

同樣的我們先定義型別  
在
> src/lib/utils/threads.ts

建立一個檔案

```ts
export interface PostInput {
  threadId?: string; //Reply才會有
  title?: string; // 標題
  name?: string; // 發文者名稱
  content?: string; // 發文內容
  youtubeLink?: string; // youtube連結
  image?: File | null; // image的圖片
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const validatePostInput = (input: PostInput) => {
  const contentFilled = !!input.content || input.content?.trim() !== "";
  const youtubeLinkFilled = !!input.youtubeLink;
  const imageFilled = !!input.image;

  // 內文 youtube連結 圖片 至少要有一個
  if (!contentFilled && !youtubeLinkFilled && !imageFilled) {
    throw new Error(
      "At least one of Content, YouTube Link, or Image must be provided"
    );
  }

  // 畫面上沒辦法同時顯示圖片跟youtube影片
  if (youtubeLinkFilled && imageFilled) {
    throw new Error(
      "You can only provide either a YouTube Link or an Image, not both"
    );
  }

  // 確保圖片大小不會超過我們設定的大小
  if (input.image) {
    if (input.image.size > MAX_IMAGE_SIZE) {
      throw new Error("Image size exceeds the limit");
    }
    if (!input.image.type.startsWith("image/")) {
      throw new Error("Only accept image");
    }
  }

  // 檢查youtube連結的正確性
  if (youtubeLinkFilled) {
    const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    const extractedId = extractYouTubeVideoId(input.youtubeLink!);
    if (!extractedId || !youtubeIdRegex.test(extractedId)) {
      throw new Error("Invalid YouTube Link");
    }
  }

  return;
};

export const extractYouTubeVideoId = (url: string): string | null => {
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

```

## 接著建立post的component

### PostContent

在src/components/thread/PostContent.tsx建立檔案  
我們希望使用者可以使用markdown語法 因此使用了ReactMarkdown

```tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const PostContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mb-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-semibold mb-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-semibold mb-2" {...props} />
        ),
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 mb-4" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-5 mb-4" {...props} />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, href, children, ...props }) => (
          <a
            href={href}
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        blockquote: ({ node, children, ...props }) => {
          return (
            <blockquote
              className={`border-l-4 border-gray-300 pl-4 italic my-1`}
              {...props}
            >
              {children}
            </blockquote>
          );
        },
      }}
      className="line-break prose prose-sm sm:prose lg:prose-lg max-w-none break-words overflow-wrap-anywhere"
    >
      {content}
    </ReactMarkdown>
  );
};
```

### PostCard

然後在同一個資料夾內建立
> src/components/thread/PostCard.tsx
的檔案

```tsx
"use client";
import React, { useState } from "react";
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
  description?: string;
  threadId?: string; // 回覆時需要帶入threadId 才知道是回覆給哪一個thread
  onClose?: () => void; // 回覆時使用彈窗來讓使用者輸入
}

export default function PostCard({
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

```


### 然後在page內使用它

修改
> src/app/service/[serviceId]/page.tsx

這個檔案

```tsx
import React from "react";
import ThreadComponent, { IThread } from "@/components/thread/ThreadComponent";
import Title, { IService } from "@/components/layout/Title";

import PostCard from "@/components/thread/PostCard";

export const threads: IThread[] = [
  {
    id: "1",
    name: "John Doe",
    title: "How to learn TypeScript",
    content:
      "I'm new to TypeScript and looking for resources to get started. Any recommendations?",
    image: "https://picsum.photos/400/300",
    youtubeID: "abc123",
    userId: "user123",
    createdAt: "2024-08-21T10:30:00Z",
    replies: [
      {
        id: "1-1",
        name: "Great resource for beginners",
        content: "You should check out the official TypeScript documentation.",
        image: "https://picsum.photos/200/200",
        userId: "user234",
        createdAt: "2024-08-21T11:00:00Z",
      },
      {
        id: "1-2",
        name: "Try this course",
        content: "Udemy has a great course on TypeScript for beginners.",
        image: "https://picsum.photos/300/200",
        userId: "user345",
        createdAt: "2024-08-21T11:15:00Z",
      },
      {
        id: "1-3",
        name: "Consider this book",
        content:
          "I recommend 'TypeScript Quickly'. It's a great book for getting started.",
        image: "https://picsum.photos/250/250",
        userId: "user456",
        createdAt: "2024-08-21T11:30:00Z",
      },
      {
        id: "1-4",
        name: "Interactive tutorials",
        content:
          "Check out TypeScript exercises on freeCodeCamp or Codecademy.",
        image: "https://picsum.photos/300/300",
        userId: "user567",
        createdAt: "2024-08-21T11:45:00Z",
      },
    ],
  },
  {
    id: "2",
    name: "Jane Smith",
    title: "React vs Angular: Which is better?",
    content:
      "I'm trying to decide between React and Angular for my next project. What are your thoughts?",
    image: "https://picsum.photos/500/300",
    youtubeID: "def456",
    userId: "user456",
    createdAt: "2024-08-20T14:45:00Z",
    replies: [
      {
        id: "2-1",
        name: "React is more flexible",
        content:
          "I prefer React because it gives me more flexibility in how I structure my projects.",
        image: "https://picsum.photos/400/400",
        userId: "user678",
        createdAt: "2024-08-20T15:00:00Z",
      },
    ],
  },
  {
    id: "3",
    name: "Alice Johnson",
    title: "My journey with Next.js",
    content:
      "I've been using Next.js for a few months now, and it's been a great experience. Here's what I've learned.",
    image: "https://picsum.photos/400/400",
    youtubeID: "ghi789",
    userId: "user789",
    createdAt: "2024-08-19T09:15:00Z",
    replies: [
      {
        id: "3-1",
        name: "Next.js is awesome!",
        content:
          "I agree, Next.js has a lot of great features, especially for SSR.",
        image: "https://picsum.photos/350/350",
        userId: "user890",
        createdAt: "2024-08-19T09:30:00Z",
      },
      {
        id: "3-2",
        name: "Static site generation",
        content: "Have you tried static site generation? It's super fast.",
        image: "https://picsum.photos/300/400",
        userId: "user901",
        createdAt: "2024-08-19T09:45:00Z",
      },
      {
        id: "3-3",
        name: "Deployment options",
        content: "Vercel makes deploying Next.js apps really easy.",
        image: "https://picsum.photos/400/300",
        userId: "user012",
        createdAt: "2024-08-19T10:00:00Z",
      },
    ],
  },
];

export default async function Page({
  params,
}: {
  params: { serviceId: string };
}) {
  const service: IService = {
    id: params.serviceId,
    name: "My Service",
    topLinks: [{ name: "Nextjs", url: "https://nextjs.org/" }],
    headLinks: [
      {
        name: "鐵人賽",
        url: "https://ithelp.ithome.com.tw/users/20168796/ironman/7445",
      },
      { name: "ithome", url: "https://ithelp.ithome.com.tw/" },
    ],
    description: "This is an example service providing various utilities.",
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      <Title service={service} />
      <PostCard description={service.description} />

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

基本上就是增加
```tsx
<PostCard description={service.description} />
```
這一行

同時由於我們將description放到了postCard內  
目的是希望使用者發文之前可以確認板規

因此就不需要在Title下面重複description了  

到
> src/components/layout/Title.tsx

內將
```tsx
<p className="text-sm text-gray-500 text-center whitespace-pre-wrap mb-2">
  {service.description}
</p>
```

給移除

## 總結

你可以嘗試在PostCard的Content內寫Markdown語法  
然後點擊Content右上角的按鈕 確認語法是否正確render

也可以嘗試content image youtubeLink都不填寫的情況下 看看錯誤會怎麼呈現

也可以根據你的需要 修改validatePostInput的規則

有興趣的話也可以去研究
```tsx
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
```

這裡的label與input之間的作用