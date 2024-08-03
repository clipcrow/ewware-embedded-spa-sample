import { Application } from "oak";

const app = new Application();

app.use(async (ctx) => {
  const { headers, url: { searchParams } } = ctx.request;
  const secret = headers.get("X-Workware-Signature");
  if (secret !== "essential-workware") {
    ctx.response.status = 401;
    ctx.response.body = `401 Unauthorized. ${secret}`;
    return;
  };
  console.log(`CORS: ${headers.get("access-control-allow-origin")}`);
  console.log(`Workspace UUID: ${searchParams.get("workspace")}`);  
  console.log(`User UUID: ${searchParams.get("user")}`);  
  try {
    await ctx.send({
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch {
    ctx.response.status = 404;
    ctx.response.body = "404 File not found.";
  }
});

await app.listen({ port: 8000 });