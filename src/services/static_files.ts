const DEFAULT_STATIC_ROOT = "./frontend/dist";
const DEFAULT_INDEX_PATH = "index.html";

const CONTENT_TYPES: Record<string, string> = {
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  woff: "font/woff",
  woff2: "font/woff2",
};

/**
 * Vite emits content-hashed filenames under /assets/, so those files can be
 * cached forever; HTML must always be revalidated so new deploys are picked up.
 */
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";
const HTML_CACHE_CONTROL = "no-cache";

export function getStaticCacheControl(assetPath: string, contentType: string): string {
  if (contentType === "text/html") return HTML_CACHE_CONTROL;
  return assetPath.includes("/assets/") ? IMMUTABLE_CACHE_CONTROL : HTML_CACHE_CONTROL;
}

export interface StaticAssetDependencies {
  rootDir?: string;
  indexPath?: string;
  readFile?: (path: string) => Promise<Uint8Array<ArrayBuffer>>;
}

export function normalizeStaticRoot(rootDir: string) {
  return rootDir.replace(/\/+$/, "");
}

export function resolveStaticAssetPath(
  pathname: string,
  rootDir = DEFAULT_STATIC_ROOT,
): string | null {
  const safePathname = decodeSafePathname(pathname);
  if (!safePathname || safePathname.startsWith("/api/")) return null;

  const pathSegments = safePathname.split("/");
  if (
    safePathname.includes("\\") ||
    safePathname.includes("\0") ||
    pathSegments.includes("..")
  ) {
    return null;
  }

  const normalizedRoot = normalizeStaticRoot(rootDir);
  if (safePathname.endsWith("/")) {
    return `${normalizedRoot}${safePathname}${DEFAULT_INDEX_PATH}`;
  }

  return `${normalizedRoot}${safePathname}`;
}

export function getStaticContentType(filePath: string) {
  const extension = filePath.split(".").pop()?.toLowerCase() || "";
  return CONTENT_TYPES[extension] || "application/octet-stream";
}

/**
 * Paths with a file extension are asset requests: a missing asset (e.g. a
 * stale hashed bundle after a redeploy) must 404 instead of serving
 * index.html as fake JS/CSS. Extensionless paths are SPA routes.
 */
export function isSpaRoutePath(pathname: string): boolean {
  const lastSegment = pathname.split("/").pop() ?? "";
  return !lastSegment.includes(".");
}

export async function serveStaticAsset(
  pathname: string,
  dependencies: StaticAssetDependencies = {},
): Promise<Response | null> {
  const rootDir = dependencies.rootDir || DEFAULT_STATIC_ROOT;
  const indexPath = dependencies.indexPath || DEFAULT_INDEX_PATH;
  const readFile = dependencies.readFile || Deno.readFile;
  const assetPath = resolveStaticAssetPath(pathname, rootDir);

  if (!assetPath) return null;

  try {
    const file = await readFile(assetPath);
    return createStaticResponse(file, getStaticContentType(assetPath), assetPath);
  } catch {
    if (!isSpaRoutePath(pathname)) return null;

    try {
      const fallbackPath = `${normalizeStaticRoot(rootDir)}/${indexPath}`;
      const indexFile = await readFile(fallbackPath);
      return createStaticResponse(indexFile, "text/html", fallbackPath);
    } catch {
      return null;
    }
  }
}

function decodeSafePathname(pathname: string) {
  try {
    return decodeURIComponent(pathname.startsWith("/") ? pathname : `/${pathname}`);
  } catch {
    return null;
  }
}

function createStaticResponse(
  file: Uint8Array<ArrayBuffer>,
  contentType: string,
  assetPath: string,
) {
  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": getStaticCacheControl(assetPath, contentType),
    },
  });
}
