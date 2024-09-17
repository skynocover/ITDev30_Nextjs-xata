"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ErrorTester: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);

  if (error) throw error;

  const triggerWindowError = () => {
    throw new Error("模擬的 window 錯誤");
  };

  const triggerUnhandledRejection = () => {
    Promise.reject(new Error("模擬的未處理 rejection"));
  };

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">錯誤測試器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={triggerWindowError}
        >
          觸發 Window 錯誤
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={triggerUnhandledRejection}
        >
          觸發未處理的 Promise 拒絕
        </Button>

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setError(new Error("手動觸發的錯誤"))}
        >
          觸發渲染中的錯誤
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorTester;
