/**
 * Deno backend server with OAuth 2.0 authentication
 */
import { Hono } from "hono";
import { cors } from "hono/middleware/cors/index.ts";
import { logger } from "hono/middleware/logger/index.ts";
import auth from "./routes/auth.ts";
import novels from "./routes/novels.ts";
import history from "./routes/history.ts";
import bookmarks from "./routes/bookmarks.ts";
import { getCorsConfig } from "./middleware/cors.ts";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors(getCorsConfig()));

// Health check (moved to /api/health to avoid conflict with frontend)
app.get("/api/health", (c) => {
  return c.json({ status: "ok", message: "Pixiv OAuth Backend" });
});

// Mount auth routes
app.route("/api/auth", auth);

// Mount novels routes
app.route("/api/novels", novels);

// Mount history routes
app.route("/api/history", history);

// Mount bookmarks routes
app.route("/api/bookmarks", bookmarks);

// Serve static files from frontend/dist
app.get("*", async (c) => {
  const path = new URL(c.req.url).pathname;

  // Skip API routes
  if (path.startsWith("/api/")) {
    return c.notFound();
  }

  try {
    // Try to serve the requested file
    let filePath = `./frontend/dist${path}`;

    // If path ends with /, serve index.html
    if (path.endsWith("/")) {
      filePath = `./frontend/dist${path}index.html`;
    }

    // Try to read the file
    const file = await Deno.readFile(filePath);

    // Determine content type
    const ext = filePath.split(".").pop();
    const contentTypes: Record<string, string> = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      svg: "image/svg+xml",
    };

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": contentTypes[ext || "html"] || "application/octet-stream",
      },
    });
  } catch {
    // If file not found, serve index.html for SPA routing
    try {
      const indexFile = await Deno.readFile("./frontend/dist/index.html");
      return c.html(new TextDecoder().decode(indexFile));
    } catch {
      return c.notFound();
    }
  }
});

// Error handling
app.onError((err, c) => {
  console.error("Error:", err);
  const status = (err as { status?: number }).status || 500;
  return c.json({
    error: err.name,
    message: err.message,
    status,
  }, status);
});

// Start server
const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`🚀 Server running on http://localhost:${port}`);

Deno.serve({ port }, app.fetch);
