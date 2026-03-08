/**
 * Shared helpers for fixture fetch scripts.
 */
const BASE = "https://api.usaspending.gov";

let requestCount = 0;
const DELAY_MS = 300; // be kind to the API

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FetchResult {
  name: string;
  ok: boolean;
  error?: string;
}

export async function fetchGet(
  name: string,
  path: string,
  dir: string,
): Promise<FetchResult> {
  if (requestCount > 0) await delay(DELAY_MS);
  requestCount++;

  const url = `${BASE}${path}`;
  process.stdout.write(`  GET  ${name}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.log(` FAIL (HTTP ${res.status})`);
      return { name, ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    const json = await res.json();
    await Bun.write(`${dir}/${name}.json`, JSON.stringify(json, null, 2));
    console.log(` OK`);
    return { name, ok: true };
  } catch (err: any) {
    console.log(` FAIL`);
    return { name, ok: false, error: err.message };
  }
}

export async function fetchPost(
  name: string,
  path: string,
  body: unknown,
  dir: string,
): Promise<FetchResult> {
  if (requestCount > 0) await delay(DELAY_MS);
  requestCount++;

  const url = `${BASE}${path}`;
  process.stdout.write(`  POST ${name}...`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.log(` FAIL (HTTP ${res.status})`);
      return { name, ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    const json = await res.json();
    await Bun.write(`${dir}/${name}.json`, JSON.stringify(json, null, 2));
    console.log(` OK`);
    return { name, ok: true };
  } catch (err: any) {
    console.log(` FAIL`);
    return { name, ok: false, error: err.message };
  }
}

export function summarize(results: FetchResult[]) {
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed.length} failed out of ${results.length} total`);
  if (failed.length > 0) {
    console.log(`\n--- FAILURES ---`);
    for (const f of failed) {
      console.log(`  ${f.name}: ${f.error}`);
    }
  }
}
