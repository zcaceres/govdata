#!/usr/bin/env bun
import { dispatch, GovHelpText } from "govdata-core";
import { blsPlugin } from "./plugin";

async function main() {
  const args = process.argv.slice(2);

  const jsonFlag = args.includes("--json");
  const filteredArgs = args.filter((a) => a !== "--json");

  if (filteredArgs.length === 0 || (args.includes("--help") && !filteredArgs[0]?.match(/^[a-z]/))) {
    const { endpoints } = blsPlugin.describe();
    console.log("Usage: bls-api <endpoint> [--param value ...]\n");
    console.log("Endpoints:");
    for (const ep of endpoints) {
      console.log(`  ${ep.name.padEnd(20)} ${ep.description}`);
    }
    console.log("\nExamples:");
    console.log("  bls-api timeseries --series-id CUUR0000SA0");
    console.log("  bls-api timeseries --series-id CUUR0000SA0,CES0500000001 --start-year 2020 --end-year 2025");
    console.log("  bls-api surveys");
    console.log("  bls-api popular");
    console.log("\nEnvironment:");
    console.log("  BLS_API_KEY          Optional API key (25 queries/day without, 500/day with)");
    console.log("\nGlobal Options:");
    console.log("  --json               Pretty-print JSON output");
    console.log("  --help               Show help");
    process.exit(0);
  }

  const result = await dispatch([blsPlugin], ["bls", ...filteredArgs]);

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
