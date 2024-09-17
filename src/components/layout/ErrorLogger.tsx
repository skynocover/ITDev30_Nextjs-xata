"use client";

import { useEffect } from "react";
import { useToast } from "@/components/hooks/use-toast";

export default function ErrorLogger() {
  const { toast } = useToast();

  const handleError = (message: string) => {
    const timestamp = new Date().toISOString();
    toast({
      variant: "destructive",
      title: "錯誤",
      description: `${message} (${timestamp})`,
    });
  };

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error);
      handleError(event.error.message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      handleError(event.reason.message);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return null;
}
