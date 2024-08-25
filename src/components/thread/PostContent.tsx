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
