#!/usr/bin/env bun
import { dispatch, GovHelpText } from "govdata-core";
import type { GovDataPlugin } from "govdata-core";
import { dogePlugin } from "doge-api";
import { naicsPlugin } from "naics-api";
import { dolPlugin } from "dol-open-data-api";
import { federalRegisterPlugin } from "federal-register";
import { usaspendingPlugin } from "usaspending-api";
import { blsPlugin } from "bls-api";

const plugins: GovDataPlugin[] = [dogePlugin, naicsPlugin, dolPlugin, federalRegisterPlugin, usaspendingPlugin, blsPlugin];

async function main() {
  const args = process.argv.slice(2);

  const jsonFlag = args.includes("--json");
  const filteredArgs = args.filter((a) => a !== "--json");

  if (filteredArgs.length === 0 || filteredArgs[0] === "--help") {
    console.log("Usage: govdata <source> <endpoint> [--param value ...]\n");
    console.log("Sources:");
    for (const p of plugins) {
      const eps = p.describe().endpoints;
      console.log(`  ${p.prefix.padEnd(22)} ${eps.length} endpoints`);
    }
    console.log("\nGlobal Options:");
    console.log("  --json               Pretty-print JSON output");
    console.log("  --help               Show help");
    console.log("\nUse 'govdata <source> --help' to see endpoints for a source.");
    process.exit(0);
  }

  const result = await dispatch(plugins, filteredArgs);

  const indent = jsonFlag ? 2 : undefined;
  console.log(JSON.stringify(
    { data: result.data, meta: result.meta, kind: result.kind },
    null,
    indent,
  ));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(err instanceof GovHelpText ? 0 : 1);
});
