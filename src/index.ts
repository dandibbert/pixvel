/**
 * Deno backend server with OAuth 2.0 authentication
 */
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import auth from "./routes/auth.ts";
import novels from "./routes/novels.ts";
import history from "./routes/history.ts";
import bookmarks from "./routes/bookmarks.ts";
import { getCorsConfig } from "./middleware/cors.ts";
import { parseServerPort } from "./services/server_config.ts";
import { serveStaticAsset } from "./services/static_files.ts";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors(getCorsConfig()));

// Health check (moved to /api/health to avoid conflict with frontend)
app.get("/api/health", (c) => {
  return c.json({ status: "ok", message: "Pixvel Backend" });
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
  return await serveStaticAsset(path) ?? c.notFound();
});

// Error handling
app.onError((err, c) => {
  console.error("Error:", err);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  const status = (err as { status?: number }).status || 500;
  return c.json({
    error: err.name,
    message: err.message,
    status,
  }, status as 500);
});

// Start server
const port = parseServerPort(Deno.env.get("PORT"));
console.log(`🚀 Server running on http://localhost:${port}`);

Deno.serve({ port }, app.fetch);
