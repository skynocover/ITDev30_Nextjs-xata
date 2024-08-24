"use client";
import React, { useState } from "react";

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

export interface IThread {
  id: string;
  name: string;
  title: string;
  content?: string;
  image?: string;
  youtubeID?: string;
  userId: string;
  createdAt: string;
  replies: IReply[];
}

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
  thread: IThread;
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
}) => {
  const [showAllReplies, setShowAllReplies] = useState(false);
  const visibleRepliesNum = 2;
  const visibleReplies = !showAllReplies
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
            {thread.title}
          </CardTitle>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 text-sm text-gray-500"
          id={thread.id}
        >
          <span className="font-semibold text-gray-700">{thread.name}</span>
          <span>ID: {thread.userId}</span>
          <span className="ml-auto flex items-center">{thread.createdAt}</span>
          <span className="text-blue-300 ml-1">No: {thread.id}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex flex-col md:flex-row md:space-x-4">
          {thread.image || thread.youtubeID ? (
            <>
              <div className="w-full md:w-1/2 mb-4 md:mb-0 h-auto">
                <MediaContent
                  imageURL={thread.image}
                  youtubeID={thread.youtubeID}
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
          {thread.replies.length > visibleRepliesNum && (
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
                      {reply.createdAt}
                    </span>
                    <span className="text-blue-300 ml-1">No: {reply.id}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-col md:flex-row md:space-x-4">
                      {reply.image || reply.youtubeID ? (
                        <>
                          <div className="w-full md:w-1/2 mb-4 md:mb-0 h-auto">
                            <MediaContent
                              imageURL={reply.image}
                              youtubeID={reply.youtubeID}
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
