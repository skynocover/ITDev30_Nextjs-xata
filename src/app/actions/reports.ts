"use server";

import { XataClient } from "@/xata";
import { auth } from "@/auth";

export const getReports = async ({ serviceId }: { serviceId: string }) => {
  const session = await auth();
  if (!session || session.user?.id !== "admin") {
    return [];
  }
  const xata = new XataClient({
    branch: serviceId,
    apiKey: process.env.XATA_API_KEY,
  });

  return xata.db.reports.getAll();
};
