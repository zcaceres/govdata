#!/usr/bin/env bun
import { dispatch, GovHelpText } from "govdata-core";
import { dogePlugin } from "./endpoints";

async function main() {
  const args = process.argv.slice(2);

  const jsonFlag = args.includes("--json");
  const filteredArgs = args.filter((a) => a !== "--json");

  if (filteredArgs.length === 0 || args.includes("--help")) {
    const { endpoints } = dogePlugin.describe();
    console.log("Usage: doge-api <endpoint> [--param value ...]\n");
    console.log("Endpoints:");
    for (const ep of endpoints) {
      console.log(`  ${ep.name.padEnd(20)} ${ep.description}`);
    }
    console.log("\nGlobal Options:");
    console.log("  --json               Pretty-print JSON output");
    console.log("  --help               Show help");
    process.exit(0);
  }

  const result = await dispatch([dogePlugin], ["doge", ...filteredArgs]);

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
