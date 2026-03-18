#!/usr/bin/env bun
import { dispatch, GovHelpText } from "govdata-core";
import { cpscPlugin } from "./plugin";

async function main() {
  const args = process.argv.slice(2);

  const jsonFlag = args.includes("--json");
  const filteredArgs = args.filter((a) => a !== "--json");

  if (filteredArgs.length === 0 || (args.includes("--help") && !filteredArgs[0]?.match(/^[a-z]/i))) {
    const { endpoints } = cpscPlugin.describe();
    console.log("Usage: cpsc-api <endpoint> [--param value ...]\n");
    console.log("Endpoints:");
    for (const ep of endpoints) {
      console.log(`  ${ep.name.padEnd(22)} ${ep.description}`);
    }
    console.log("\nExamples:");
    console.log("  cpsc-api recalls --RecallDateStart 2025-01-01 --RecallDateEnd 2025-01-31");
    console.log("  cpsc-api recalls --RecallID 10141");
    console.log("  cpsc-api recalls --ProductName mattress --ManufacturerCountry China");
    console.log("  cpsc-api penalties --penaltytype civil --fiscalyear 2025");
    console.log("  cpsc-api penalty-companies --penaltytype criminal");
    console.log("  cpsc-api penalty-products");
    console.log("  cpsc-api penalty-years");
    console.log("\nGlobal Options:");
    console.log("  --json               Pretty-print JSON output");
    console.log("  --help               Show help");
    process.exit(0);
  }

  const result = await dispatch([cpscPlugin], ["cpsc", ...filteredArgs]);

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
