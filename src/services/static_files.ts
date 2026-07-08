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
};

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
    return createStaticResponse(file, getStaticContentType(assetPath));
  } catch {
    try {
      const fallbackPath = `${normalizeStaticRoot(rootDir)}/${indexPath}`;
      const indexFile = await readFile(fallbackPath);
      return createStaticResponse(indexFile, "text/html");
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

function createStaticResponse(file: Uint8Array<ArrayBuffer>, contentType: string) {
  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": contentType,
    },
  });
}
