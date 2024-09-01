import { NextResponse } from "next/server";
import { ILinkItem } from "@/components/layout/Title";
import { NextAuthRequest } from "@/auth";
import {
  withServiceOwnerCheck,
  ServiceOwnerContext,
} from "@/lib/middleware/serviceOwnerCheck";

const put = async (req: NextAuthRequest, context: ServiceOwnerContext) => {
  try {
    const { xata, service } = context;

    const data = await req.json();
    const name = data.name as string;
    const description = data.description as string;
    const topLinks = data.topLinks as ILinkItem;
    const headLinks = data.headLinks as ILinkItem;

    await xata.db.services.update(service.id, {
      name: name.trim(),
      description,
      topLinks: topLinks || [],
      headLinks: headLinks || [],
    });

    return NextResponse.json({
      message: "Service updated successfully",
    });
  } catch (error: any) {
    console.error("Service update error:", error);
    return NextResponse.json(
      { error: "Service update failed: " + error.message },
      { status: 500 }
    );
  }
};

export const PUT = withServiceOwnerCheck(put);
