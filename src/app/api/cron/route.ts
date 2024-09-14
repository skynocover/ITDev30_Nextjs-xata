export function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const currentTime = new Date().toISOString();
  return new Response(`Current time: ${currentTime}`);
}
