import { Suspense } from "react";
import Link from "next/link";

import { getService } from "@/lib/database/service";
import { getThreadsWithReplyCount } from "@/lib/database/thread";
import { ThreadCarousel } from "@/components/homepage/ThreadCarousel";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { ProfileButton } from "@/components/service/ProfileButton";

export const revalidate = 1800;
const serviceIds = ["main"];

export default async function Home() {
  return (
    <div className="space-y-4">
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
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-4xl">Welcome to Akraft</CardTitle>
          <CardDescription className="text-xl">
            Create and explore your own discussion communities
          </CardDescription>
        </CardHeader>
      </Card>

      <div>
        <div className="space-y-6">
          {serviceIds.map(async (serviceId) => {
            const service = await getService({ serviceId });
            const threads = await getThreadsWithReplyCount({
              serviceId,
              pageSize: 8,
            });
            return (
              <Card key={serviceId} className="w-full">
                <CardHeader>
                  <Link
                    href={`/service/${serviceId}`}
                    target="_blank"
                    key={serviceId}
                  >
                    <CardTitle>{service?.name || "Loading..."}</CardTitle>
                  </Link>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="text-center py-4">
                        Loading latest threads...
                      </div>
                    }
                  >
                    <ThreadCarousel serviceId={serviceId} threads={threads} />
                  </Suspense>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
