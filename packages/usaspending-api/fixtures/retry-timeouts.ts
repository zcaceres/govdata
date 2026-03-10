#!/usr/bin/env bun
/**
 * Retry endpoints that timed out, with longer timeouts and retries.
 */
const BASE = "https://api.usaspending.gov";

async function fetchWithRetry(
  name: string,
  url: string,
  init: RequestInit | undefined,
  outPath: string,
  maxRetries = 3,
  timeoutMs = 120_000,
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`  ${name} (attempt ${attempt}/${maxRetries}, timeout ${timeoutMs / 1000}s)...`);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);

      if (res.status === 504) {
        console.log(`    504 Gateway Timeout — retrying...`);
        await new Promise((r) => setTimeout(r, 5000 * attempt));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        console.log(`    HTTP ${res.status}: ${text.slice(0, 200)}`);
        return false;
      }

      const json = await res.json();
      await Bun.write(outPath, JSON.stringify(json, null, 2));
      console.log(`    OK — saved to ${outPath.split("/").slice(-2).join("/")}`);
      return true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log(`    Timed out after ${timeoutMs / 1000}s — retrying...`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      console.log(`    Error: ${err.message}`);
      return false;
    }
  }
  console.log(`    FAILED after ${maxRetries} attempts`);
  return false;
}

const dir = `${import.meta.dir}`;

// 1. Disaster overview (GET) — tends to 504
await fetchWithRetry(
  "disaster/overview",
  `${BASE}/api/v2/disaster/overview/`,
  undefined,
  `${dir}/disaster/overview.json`,
  3,
  120_000,
);

// 2. Spending by recipient (POST) — tends to 504
await fetchWithRetry(
  "spending/by-recipient",
  `${BASE}/api/v2/spending/`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "recipient",
      filters: { fy: "2024", period: "12" },
    }),
  },
  `${dir}/spending/by-recipient.json`,
  3,
  120_000,
);

console.log("\nDone!");
