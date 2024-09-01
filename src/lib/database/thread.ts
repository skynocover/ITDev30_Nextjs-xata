import { XataClient, ThreadsRecord, RepliesRecord } from "../../xata";

type WithoutImage<T> = Omit<T, "image">;

export type ThreadWithReplies = WithoutImage<ThreadsRecord> & {
  image?: string;
  replies: (WithoutImage<RepliesRecord> & {
    image?: string;
    threadId: string;
  })[];
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
          threadId: thread.id,
          image: reply.image?.url,
        }));

        return {
          ...thread,
          replies: transformedReplies,
          image: thread.image?.url,
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
      image: thread.image?.url,
      replies: replies.map((reply) => ({
        ...reply,
        image: reply.image?.url,
        threadId: reply.thread?.id || "",
        thread: undefined,
      })),
    };

    return threadWithReplies;
  } catch (error) {
    console.error("Error fetching thread with replies:", error);
    return null;
  }
};
