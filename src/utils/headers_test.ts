import { assertStrictEquals as assertEquals } from "../services/test_asserts.ts";
import { buildPixivHeaders } from "./headers.ts";
import { calcClientHash } from "./md5.ts";

const HEX_MD5_PATTERN = /^[0-9a-f]{32}$/;
const ISO_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/;

Deno.test("buildPixivHeaders includes all required static headers", () => {
  const headers = buildPixivHeaders();
  assertEquals(headers["User-Agent"], "PixivAndroidApp/5.0.166 (Android 10.0; Pixel C)");
  assertEquals(headers["App-OS"], "Android");
  assertEquals(headers["App-OS-Version"], "Android 10.0");
  assertEquals(headers["App-Version"], "5.0.166");
  assertEquals(headers["Accept-Language"], "zh-CN");
  assertEquals(headers["Host"], "app-api.pixiv.net");
});

Deno.test("buildPixivHeaders generates X-Client-Time in ISO 8601 with +00:00 suffix", () => {
  const headers = buildPixivHeaders();
  assertEquals(ISO_TIME_PATTERN.test(headers["X-Client-Time"]), true);
});

Deno.test("buildPixivHeaders generates X-Client-Hash as 32-char hex string", () => {
  const headers = buildPixivHeaders();
  assertEquals(HEX_MD5_PATTERN.test(headers["X-Client-Hash"]), true);
});

Deno.test("buildPixivHeaders X-Client-Hash matches calcClientHash for the same time", () => {
  const headers = buildPixivHeaders();
  const expectedHash = calcClientHash(headers["X-Client-Time"]);
  assertEquals(headers["X-Client-Hash"], expectedHash);
});

Deno.test("buildPixivHeaders adds Authorization header when accessToken is provided", () => {
  const headers = buildPixivHeaders("test-token-123");
  assertEquals(headers["Authorization"], "Bearer test-token-123");
});

Deno.test("buildPixivHeaders omits Authorization header when no accessToken is provided", () => {
  const headers = buildPixivHeaders();
  assertEquals(headers["Authorization"], undefined);
});
