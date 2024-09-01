import React from "react";
import { notFound } from "next/navigation";

import { getService } from "@/lib/database/service";

import { ProfileButton } from "@/components/service/ProfileButton";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import ServiceEditor from "@/components/service/ServiceEditor";
import ReportList from "@/components/service/ReportList";

export default async function Page({
  params,
}: {
  params: { serviceId: string };
}) {
  const service = await getService({ serviceId: params.serviceId });
  if (!service) {
    return notFound();
  }

  const session = await auth();
  const userId = session?.user?.id;

  return (
    <div className="container mx-auto space-y-4 max-w-4xl">
      <div className="flex items-center justify-between py-4 border-b">
        <Link href="/" passHref>
          <Button variant="link" className="text-2xl font-bold p-0">
            Akraft
          </Button>
        </Link>
        <nav className="flex items-center space-x-2">
          <Button variant="ghost">About</Button>
          <Button variant="outline" size="icon" asChild>
            <Link
              href="https://github.com/skynocover/akraft"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <ProfileButton />
        </nav>
      </div>
      {userId === "admin" ? (
        <>
          <ServiceEditor service={service} serviceId={params.serviceId} />
          <ReportList serviceId={params.serviceId} />
        </>
      ) : (
        <>
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error：</strong>
            <span className="block sm:inline">
              You are not the owner of this service。
            </span>
          </div>
        </>
      )}
    </div>
  );
}
