import { assertStrictEquals as assertEquals } from "./test_asserts.ts";
import {
  getStaticContentType,
  normalizeStaticRoot,
  resolveStaticAssetPath,
  serveStaticAsset,
} from "./static_files.ts";

async function readText(response: Response) {
  return await response.text();
}

Deno.test("resolveStaticAssetPath maps app paths into frontend dist", () => {
  assertEquals(resolveStaticAssetPath("/", "./frontend/dist"), "./frontend/dist/index.html");
  assertEquals(
    resolveStaticAssetPath("/assets/app.js", "./frontend/dist"),
    "./frontend/dist/assets/app.js",
  );
  assertEquals(
    resolveStaticAssetPath("/nested/", "./frontend/dist"),
    "./frontend/dist/nested/index.html",
  );
});

Deno.test("normalizeStaticRoot removes trailing slashes from configured roots", () => {
  assertEquals(normalizeStaticRoot("./frontend/dist///"), "./frontend/dist");
});

Deno.test("resolveStaticAssetPath rejects API and traversal paths", () => {
  assertEquals(resolveStaticAssetPath("/api/health", "./frontend/dist"), null);
  assertEquals(resolveStaticAssetPath("/../deno.json", "./frontend/dist"), null);
  assertEquals(resolveStaticAssetPath("/%2e%2e/deno.json", "./frontend/dist"), null);
  assertEquals(resolveStaticAssetPath("/assets\\app.js", "./frontend/dist"), null);
  assertEquals(resolveStaticAssetPath("/%5cdeno.json", "./frontend/dist"), null);
});

Deno.test("getStaticContentType returns known web asset content types", () => {
  assertEquals(getStaticContentType("./frontend/dist/index.html"), "text/html");
  assertEquals(getStaticContentType("./frontend/dist/assets/app.css"), "text/css");
  assertEquals(getStaticContentType("./frontend/dist/assets/app.js"), "application/javascript");
  assertEquals(getStaticContentType("./frontend/dist/assets/data.json"), "application/json");
  assertEquals(getStaticContentType("./frontend/dist/assets/logo.png"), "image/png");
  assertEquals(getStaticContentType("./frontend/dist/assets/logo.jpg"), "image/jpeg");
  assertEquals(getStaticContentType("./frontend/dist/assets/icon.svg"), "image/svg+xml");
  assertEquals(
    getStaticContentType("./frontend/dist/assets/font.woff2"),
    "application/octet-stream",
  );
});

Deno.test("serveStaticAsset returns asset responses with content type", async () => {
  const response = await serveStaticAsset("/assets/app.js", {
    rootDir: "./frontend/dist",
    readFile: (path) => {
      assertEquals(path, "./frontend/dist/assets/app.js");
      return Promise.resolve(new TextEncoder().encode("console.log('ok')"));
    },
  });

  if (!response) throw new Error("Expected static asset response");

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Content-Type"), "application/javascript");
  assertEquals(await readText(response), "console.log('ok')");
});

Deno.test("serveStaticAsset falls back to SPA index when an app route is not a file", async () => {
  const readPaths: string[] = [];
  const response = await serveStaticAsset("/novels/123", {
    rootDir: "./frontend/dist",
    readFile: (path) => {
      readPaths.push(path);
      if (path.endsWith("/index.html")) {
        return Promise.resolve(new TextEncoder().encode("<html>app</html>"));
      }
      return Promise.reject(new Deno.errors.NotFound());
    },
  });

  if (!response) throw new Error("Expected SPA fallback response");

  assertEquals(readPaths.join(","), "./frontend/dist/novels/123,./frontend/dist/index.html");
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Content-Type"), "text/html");
  assertEquals(await readText(response), "<html>app</html>");
});

Deno.test("serveStaticAsset returns null for API or unsafe paths", async () => {
  const readFile = () => {
    throw new Error("readFile should not be called");
  };

  assertEquals(await serveStaticAsset("/api/health", { readFile }), null);
  assertEquals(await serveStaticAsset("/../deno.json", { readFile }), null);
});
