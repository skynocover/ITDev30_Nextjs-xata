## 我們將新增thread的API也改成使用server action

先新增src/app/actions/threads.ts

```ts
"use server";
import { headers } from "next/headers";

import { extractYouTubeVideoId, generateUserId } from "@/lib/utils/threads";
import { XataClient } from "@/xata";

export interface Image {
  name: string;
  mediaType: string;
  base64Content: string;
  enablePublicUrl: boolean;
}
interface CreateThreadParams {
  serviceId: string;
  name?: string;
  title?: string;
  content?: string;
  youtubeLink?: string;
  image?: Image | null;
}

export const createThread = async ({
  serviceId,
  name,
  title,
  content,
  youtubeLink,
  image,
}: CreateThreadParams) => {
  const ip = await getClientIP();
  const userId = generateUserId(ip);

  const xata = new XataClient({
    branch: serviceId,
    apiKey: process.env.XATA_API_KEY,
  });

  await xata.db.threads.create({
    title: (title && title.trim()) || "Untitled",
    name: (name && name.trim()) || "anonymous",
    content,
    youtubeID: youtubeLink ? extractYouTubeVideoId(youtubeLink) : undefined,
    image,
    replyAt: new Date(),
    userId,
    userIp: ip,
  });
};

export async function getClientIP() {
  const headersList = headers();

  const forwardedFor = headersList.get("x-forwarded-for");
  const realIP = headersList.get("x-real-ip");

  let clientIP: string | null = null;

  if (forwardedFor) {
    clientIP = forwardedFor.split(",")[0].trim();
  } else if (realIP) {
    clientIP = realIP;
  }

  return clientIP || "Unknown";
}
```

並且在src/components/thread/PostCard.tsx中修改

```tsx
"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Link,
  Eye,
  EyeOff,
  Loader,
  X,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { PostContent } from "./PostContent";
import { createThread, Image } from "@/app/actions/threads";
import { fileToBase64 } from "@/lib/utils/threads";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useTransition();
  const [formContent, setFormContent] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const rawFormData: any = Object.fromEntries(formData.entries());
    rawFormData.serviceId = serviceId;

    if (isReply) {
      rawFormData.threadId = threadId;
      rawFormData.sage = formData.get("sage") === "on";
    }

    let image: Image | null | undefined = undefined;

    const imageFile = formData.get("image") as File | null;
    if (imageFile) {
      image = {
        name: encodeURIComponent(imageFile.name),
        mediaType: imageFile.type,
        base64Content: await fileToBase64(imageFile),
        enablePublicUrl: true,
      };
    }

    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const youtubeLink = formData.get("youtubeLink") as string;
    const input = {
      title,
      name,
      content,
      youtubeLink: youtubeLink,
      image,
    };

    try {
      await createThread({ ...input, serviceId });

      router.refresh();

      return { success: true };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  const onSubmit = async (formData: FormData) => {
    setError(null);
    setIsLoading(async () => {
      const result = await handleSubmit(formData);
      if ("error" in result) {
        setError(result.error || "An unexpected error occurred");
      } else if (isReply && onClose) {
        onClose();
      }
    });
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
        <form action={onSubmit} className="space-y-2">
          <div className="flex space-x-2">
            {!isReply && (
              <Input
                name="title"
                placeholder="Title"
                className="text-base"
                disabled={isLoading}
              />
            )}
            <Input
              name="name"
              placeholder="Name"
              className="text-base"
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

            <div className="min-h-40" hidden={!isPreview}>
              <PostContent content={formContent} />
            </div>

            <Textarea
              name="content"
              placeholder="Content"
              className={`h-40 text-sm border ${isPreview ? "hidden" : ""}`}
              disabled={isLoading}
              onChange={(e) => setFormContent(e.target.value)}
            />
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
                  name="youtubeLink"
                  placeholder="YouTube Link"
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
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    className="hidden"
                    disabled={isLoading}
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </TabsContent>
          </Tabs>

          {!isReply && description && (
            <div className="text-sm text-gray-500 whitespace-pre-wrap">
              {description}
            </div>
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
                <Checkbox id="sage" name="sage" />
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

在新的程式碼中 我們不再需要 `title` `name` `sage` `youtubeLink` 這些state
因為我們將他們改由formData來管理

並且我們將
```ts
 if (imageFile) {
      image = {
        name: encodeURIComponent(imageFile.name),
        mediaType: imageFile.type,
        base64Content: await fileToBase64(imageFile),
        enablePublicUrl: true,
      };
    }
```
這段改成在前端實作
這是因為使用server action時 只能傳遞plain data
也因此我們沒辦法像是api一樣將整個image直接傳遞到後端
因此我們先在前端平面化之後再交給後端

另外 由於server action的body大小限制跟api的不一樣
因此我們需要修改next.config.mjs

```ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
```

bodySizeLimit 預設是 1mb, 你可以改成你希望的大小

## 總結

我們今天使用了form來實作新增thread
你可以用同樣的方式來修改新增reply

我們這裡就不實作




