#!/usr/bin/env bun
import { parseArgs } from "util";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient, listDatasets } from "../src/client.js";
import { createDescribe } from "../src/describe.js";
import { AGENCIES, type Agency, type EndpointFor } from "../src/datasets.js";
import { FilterExpression } from "../src/schemas.js";
import { wrapResponse } from "../src/response.js";

function loadEnvFile(): void {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
    break;
  }
}

loadEnvFile();

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    "api-key": { type: "string", short: "k" },
    limit: { type: "string", short: "l" },
    offset: { type: "string", short: "o" },
    fields: { type: "string", short: "f" },
    sort: { type: "string" },
    "sort-by": { type: "string" },
    filter: { type: "string" },
    format: { type: "string" },
    summary: { type: "boolean" },
    pretty: { type: "boolean", short: "p" },
    help: { type: "boolean", short: "h" },
  },
  allowPositionals: true,
});

function print(data: unknown) {
  console.log(values.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data));
}

function usage() {
  console.log(`Usage:
  dol-api setup                             Save your API key to .env
  dol-api datasets                          List all datasets (no key needed)
  dol-api get <agency> <endpoint> [opts]    Fetch dataset rows
  dol-api metadata <agency> <endpoint>      Fetch dataset metadata
  dol-api describe <agency> <endpoint>      Describe a dataset (columns, info)

Options:
  -k, --api-key <key>    API key (or set DOL_API_KEY env var, or run 'dol-api setup')
  -l, --limit <n>        Row limit (default 10, max 10000)
  -o, --offset <n>       Row offset
  -f, --fields <a,b,c>   Comma-separated field list
  --sort <asc|desc>      Sort direction
  --sort-by <field>      Sort field
  --filter <json>        Filter expression (JSON)
  --format <fmt>         Output format: json (default), markdown, csv
  --summary              Print summary instead of raw data
  -p, --pretty           Pretty-print JSON output
  -h, --help             Show this help

Agencies: ${Object.keys(AGENCIES).join(", ")}`);
}

function setupApiKey(): void {
  const key = positionals[1] || values["api-key"];
  if (!key) {
    console.error("Usage: dol-api setup <YOUR_API_KEY>");
    console.error("       dol-api setup -k <YOUR_API_KEY>");
    console.error("\nGet a free key at: https://data.dol.gov/registration");
    process.exit(1);
  }

  const envPath = resolve(process.cwd(), ".env");
  let content = "";
  if (existsSync(envPath)) {
    content = readFileSync(envPath, "utf-8");
    if (content.includes("DOL_API_KEY=")) {
      content = content.replace(/^DOL_API_KEY=.*$/m, `DOL_API_KEY=${key}`);
    } else {
      content = content.trimEnd() + `\nDOL_API_KEY=${key}\n`;
    }
  } else {
    content = `DOL_API_KEY=${key}\n`;
  }
  writeFileSync(envPath, content);
  console.log("API key saved to .env");
  console.log("Test it: dol-api get MSHA accident -l 5 --format markdown");
}

function resolveApiKey(): string {
  const apiKey = values["api-key"] || process.env.DOL_API_KEY;
  if (!apiKey) {
    console.error("Error: API key required.");
    console.error("  Run:  dol-api setup <YOUR_API_KEY>");
    console.error("  Or:   --api-key <key> / DOL_API_KEY env var");
    process.exit(1);
  }
  return apiKey;
}

async function main() {
  const command = positionals[0];

  if (values.help || !command) {
    usage();
    process.exit(values.help ? 0 : 1);
  }

  if (command === "setup") {
    setupApiKey();
    return;
  }

  if (command === "datasets") {
    const result = await listDatasets();
    print(result);
    return;
  }

  if (command !== "get" && command !== "metadata" && command !== "describe") {
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
  }

  const apiKey = resolveApiKey();

  const agency = positionals[1] as Agency;
  const endpoint = positionals[2];

  if (!agency || !endpoint) {
    console.error("Error: agency and endpoint are required.");
    usage();
    process.exit(1);
  }

  if (!(agency in AGENCIES)) {
    console.error(`Error: unknown agency "${agency}". Valid: ${Object.keys(AGENCIES).join(", ")}`);
    process.exit(1);
  }

  const client = createClient({ apiKey });

  if (command === "describe") {
    const describe = createDescribe({
      getMetadata: client.getMetadata,
      listDatasets: () => listDatasets(),
    });
    const desc = await describe(agency, endpoint as EndpointFor<typeof agency>);
    if (values.format === "json" || (!values.format && !values.pretty)) {
      print(desc);
    } else {
      console.log(desc.textSummary);
    }
    return;
  }

  if (command === "metadata") {
    const result = await client.getMetadata(agency, endpoint as any);
    print(result);
    return;
  }

  if (command === "get") {
    const params: Record<string, unknown> = {};
    if (values.limit) params.limit = parseInt(values.limit, 10);
    if (values.offset) params.offset = parseInt(values.offset, 10);
    if (values.fields) params.fields = values.fields.split(",");
    if (values.sort) params.sort = values.sort;
    if (values["sort-by"]) params.sort_by = values["sort-by"];
    if (values.filter) params.filter = FilterExpression.parse(JSON.parse(values.filter));

    const result = await client.getData(agency, endpoint as any, params as any);
    const wrapped = wrapResponse(result, agency, endpoint);

    if (values.summary) {
      console.log(wrapped.summary());
      return;
    }

    const fmt = values.format ?? "json";
    if (fmt === "markdown") {
      console.log(wrapped.toMarkdown());
    } else if (fmt === "csv") {
      console.log(wrapped.toCSV());
    } else {
      print(result);
    }
    return;
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
