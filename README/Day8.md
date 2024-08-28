# 

## Reply的按鈕

我們希望在Thread的title部分 加上回覆給Thread的按鈕

因此在昨天的
> src/components/thread/PostCard.tsx

內 加上以下的程式碼

```tsx
interface IReplyModal {
  threadId: string;
}

export const ReplyButton: React.FC<IReplyModal> = ({ threadId }) => {
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

然後在
> src/components/thread/ThreadComponent.tsx

內 的Title旁邊 加上Reply的按鈕

```tsx
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
<ReplyButton threadId={thread.id} />
```

然後你應該就可以看到Title旁邊有一個回覆按鈕了  
並且點擊之後可以看到回覆的彈窗

### 功能解釋

新增thread及新增回覆最大的差別在於

- 回覆不需要Title
- 回覆需要有一個sage的設定, 目的是不推文, 也就是不會更新thread的排序

關於thread的排序 到了DB部分會有更詳細的解釋

## 總結

這樣我們的畫面就算完成了

明天開始我們來規劃DB



