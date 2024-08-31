// Generated by Xata Codegen 0.30.0. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "services",
    columns: [
      { name: "name", type: "string" },
      { name: "topLinks", type: "json", notNull: true, defaultValue: "[]" },
      { name: "headLinks", type: "json", notNull: true, defaultValue: "[]" },
      { name: "description", type: "text" },
    ],
  },
  {
    name: "threads",
    columns: [
      { name: "title", type: "string", defaultValue: "Untitled" },
      { name: "name", type: "string", defaultValue: "anonymous" },
      { name: "content", type: "text" },
      { name: "image", type: "file" },
      { name: "youtubeID", type: "string" },
      { name: "replyAt", type: "datetime" },
      { name: "userId", type: "string" },
      { name: "userIp", type: "string" },
    ],
    revLinks: [{ column: "thread", table: "replies" }],
  },
  {
    name: "replies",
    columns: [
      { name: "name", type: "string", defaultValue: "anonymous" },
      { name: "content", type: "text" },
      { name: "image", type: "file" },
      { name: "youtubeID", type: "string" },
      { name: "thread", type: "link", link: { table: "threads" } },
      { name: "userId", type: "string" },
      { name: "userIp", type: "string" },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Services = InferredTypes["services"];
export type ServicesRecord = Services & XataRecord;

export type Threads = InferredTypes["threads"];
export type ThreadsRecord = Threads & XataRecord;

export type Replies = InferredTypes["replies"];
export type RepliesRecord = Replies & XataRecord;

export type DatabaseSchema = {
  services: ServicesRecord;
  threads: ThreadsRecord;
  replies: RepliesRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://EricWu-s-workspace-2lkpjt.ap-southeast-2.xata.sh/db/ithome",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
