import { Application } from "oak";

const app = new Application();

app.use(async (context, next) => {
  const secret = context.request.headers.get("X-Workware-Signature");
  if (secret === "essential-workware") {
    return await next();
  };
  context.response.status = 401;
});

app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

await app.listen({ port: 8000 });