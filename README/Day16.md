## 查看回報

為了方便我們快速引導至Dashboard畫面

我們可以在最上方的連結中 加入dashboard的連結

在`src/components/layout/Title.tsx`中

新增以下的連結

```tsx
<Link
  href={`/dashboard/main`}
  className="text-gray-400 hover:text-gray-600 flex items-center"
>
  Dashboard <Link2 className="ml-1 h-3 w-3" />
</Link>
```

然後你就可以點擊Dashboard連結 看到Dashboard畫面了

### 新增回報列表

我們一樣先安裝今天會用到的套件

```bash
npx shadcn@latest add tooltip toast table
```

並且建立`src/components/service/ReportList.tsx`

```tsx
"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Trash2, ExternalLink, FileX, MessageSquareX } from "lucide-react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ReportsRecord } from "@/xata";
import LoadingOverlay from "../commons/LoadingOverlay";
import { useToast } from "@/components/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReportListProps {
  serviceId: string;
}

const ReportList: React.FC<ReportListProps> = ({ serviceId }) => {
  const [reports, setReports] = useState<ReportsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/service/${serviceId}/reports`);
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDeleteReports = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/service/${serviceId}/reports`, {
        data: { reportIds: selectedReports },
      });
      fetchReports();
      setSelectedReports([]);
      toast({
        title: "Success",
        description: "Report(s) has been deleted.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting reports:", error);
    }
  };

  const handleDeleteThreadOrReply = async (report: ReportsRecord) => {
    setIsLoading(true);
    setDeletingItemId(report.id);
    try {
      if (report.reply?.id || report.thread?.id) {
        await axios.delete(`/api/service/${serviceId}/reports`, {
          data: { reportIds: [report.id], deleteAssociated: true },
        });
        toast({
          title: "Success",
          description: "Thread or Reply has been deleted.",
          variant: "default",
        });
      } else {
        toast({
          title: "Info",
          description: "No associated thread or reply to delete.",
          variant: "default",
        });
      }
      fetchReports();
    } catch (error) {
      console.error("Error deleting thread or reply:", error);
      toast({
        title: "Error",
        description: "Failed to delete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleViewReport = (threadId: string, replyId?: string) => {
    const url = `/service/${serviceId}/${threadId}${
      replyId ? `#${replyId}` : `#${threadId}`
    }`;
    window.open(url, "_blank");
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAllReports = () => {
    setSelectedReports(
      selectedReports.length === reports.length
        ? []
        : reports.map((report) => report.id)
    );
  };

  return (
    <LoadingOverlay isLoading={isLoading}>
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="ml-1"
                        size="icon"
                        variant="destructive"
                        disabled={selectedReports.length === 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reports</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will delete the selected report records.
                          It will not affect the associated threads or replies.
                          Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteReports}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Delete selected report records (does not affect threads or
                    replies)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedReports.length === reports.length &&
                      reports.length !== 0
                    }
                    onCheckedChange={handleSelectAllReports}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Reporter IP</TableHead>
                <TableHead>Poster IP</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={() => handleSelectReport(report.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(report.xata.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{report.content}</TableCell>
                  <TableCell>{report.userIp}</TableCell>
                  <TableCell>{report.reportedIp}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            disabled={!report.thread && !report.reply}
                            onClick={() =>
                              handleViewReport(
                                report.thread?.id || "",
                                report.reply?.id || ""
                              )
                            }
                            size="icon"
                            variant="outline"
                            className="mr-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Open in new tab</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="destructive"
                                disabled={
                                  deletingItemId === report.id ||
                                  (!report.thread && !report.reply)
                                }
                              >
                                {report.reply?.id ? (
                                  <MessageSquareX className="h-4 w-4" />
                                ) : (
                                  <FileX className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete {report.reply?.id ? "Reply" : "Thread"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the{" "}
                                  {report.reply?.id ? "reply" : "thread"}{" "}
                                  associated with this report. Are you sure you
                                  want to proceed?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteThreadOrReply(report)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {report.reply?.id
                              ? "Delete Reply"
                              : "Delete Thread"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LoadingOverlay>
  );
};

export default ReportList;

```

然後你就可以在你的dashboard頁面中 看到ReportList了

發文者IP及回報者IP都是::1是因為我們都在本地使用 所以IP都是127.0.0.1

實際在線上使用時 會是真實的IP

### 嘗試刪除report

我們這裡實作了兩種刪除

第一種是單純刪除回報 理由是可能誤報 或是單純判定不需要刪除
你可以點選左邊的checkbox 選擇多個report 然後按下Delete按鈕 就可以刪除多個report

第二種是刪除report的thread或是reply
也就是判定需要刪除的討論串或回覆

直接點選action內的delete按鈕 你就可以將討論串或回覆刪除了

### 嘗試未登入時使用api

你可以直接在網址列輸入

```
http://localhost:3000/api/service/main/reports
```

應該可以看到你的回報

但是如果你開啟無痕視窗
然後再次開啟這個網址 應該會看到錯誤

```json
{"error":"You are not owner of service"}
```

這表你的api是好好的在authjs的保護之下

## 總結

我們今天實作了查看report的功能

並且使用瀏覽器測試了看我們的api是否在authjs的保護之下