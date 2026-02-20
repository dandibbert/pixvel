/**
 * CORS middleware configuration
 */

export function getCorsConfig() {
  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS") || "";
  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  // Fallback to localhost for development
  if (allowedOrigins.length === 0) {
    allowedOrigins.push("http://localhost:3000", "http://localhost:8000");
  }

  return {
    origin: allowedOrigins,
    credentials: true,
  };
}
