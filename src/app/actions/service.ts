"use server";

import { XataClient, ServicesRecord } from "@/xata";
import { auth } from "@/auth";

export async function updateService(serviceId: string, data: ServicesRecord) {
  try {
    const session = await auth();
    if (!session || session.user?.id !== "admin") {
      throw new Error("You don't have permission");
    }

    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });
    const service = await xata.db.services.getFirst();

    if (!service) {
      throw new Error("Service not found");
    }
    if (!session || session.user?.id !== "admin") {
      throw new Error("You don't have permission");
    }

    await xata.db.services.update(service.id, {
      name: data.name?.trim(),
      description: data.description,
      topLinks: data.topLinks || [],
      headLinks: data.headLinks || [],
      permissions: data.permissions || {},
    });

    return { message: "Service updated successfully" };
  } catch (error: any) {
    console.error("Service update error:", error);
    throw new Error("Service update failed: " + error.message);
  }
}
