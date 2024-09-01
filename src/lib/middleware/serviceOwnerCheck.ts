import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { auth } from "@/auth";

import { XataClient, ServicesRecord } from "@/xata";

export interface NextAuthRequest extends NextRequest {
  auth: Session | null;
}

export const handleRole = (handler: Function) => {
  return auth(async (req: NextAuthRequest, context: any) => {
    const serviceId = context.params.serviceId;
    const xata = new XataClient({
      branch: serviceId,
      apiKey: process.env.XATA_API_KEY,
    });
    const service = await xata.db.services.getFirst();
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    const isOwner = req.auth?.user?.id === "admin";
    return handler(req, { ...context, xata, service, isOwner });
  });
};

export interface ServiceRoleContext {
  xata: XataClient;
  service: ServicesRecord;
  isOwner: boolean;
}

export const withServiceOwnerCheck = (handler: Function) => {
  return handleRole(
    async (req: NextAuthRequest, context: ServiceRoleContext) => {
      if (!context.isOwner) {
        return NextResponse.json(
          { error: "You are not owner of service" },
          { status: 403 }
        );
      }
      return handler(req, context);
    }
  );
};

export type ServiceOwnerContext = ServiceRoleContext;
