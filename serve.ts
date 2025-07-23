import { Application } from "oak";

const app = new Application();

// This is a list of origins that are allowed to access the server.
const ALLOWED_ORIGINS = ["http://localhost:5000", "https://clipcrow.net", "https://clipcrow.dev"]; 

app.use(async (ctx) => {
  const { headers, url: { searchParams } } = ctx.request;

  // check the origin of the request
  // The 'Origin' or 'Referer' header is automatically attached by the browser when loading an iframe.
  const origin = headers.get("Origin");
  const referer = headers.get("Referer");

  // If there is no 'Origin' or 'Referer' header, this may be a request from mobile or another tool.
  // We only perform this check if one of the two headers exists.
  const isFromBrowser = origin || referer;
  if (isFromBrowser) {
    const isAllowed = (origin && ALLOWED_ORIGINS.includes(origin)) || 
                      (referer && ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed)));

    if (!isAllowed) {
      ctx.response.status = 403; // 403 Forbidden
      ctx.response.body = `403 Forbidden: Invalid origin.`;
      return;
    }
  }

  const signatureFromHeader = headers.get("X-ClipCrow-Signature");
  const signatureFromUrl = searchParams.get("X-ClipCrow-Signature");
  const secret = signatureFromHeader || signatureFromUrl;

  if (secret !== "clipcrow") { 
    ctx.response.status = 401;
    ctx.response.body = `401 Unauthorized. Invalid signature.`;
    return;
  }

  console.log(`Request validated successfully.`);
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

console.log(`Server listening on http://localhost:8000`);
await app.listen({ port: 8000 });