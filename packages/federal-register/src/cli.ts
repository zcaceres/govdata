#!/usr/bin/env bun
import { dispatch, GovHelpText } from "govdata-core";
import { federalRegisterPlugin } from "./plugin";

async function main() {
  const args = process.argv.slice(2);

  const jsonFlag = args.includes("--json");
  const filteredArgs = args.filter((a) => a !== "--json");

  if (filteredArgs.length === 0 || args.includes("--help")) {
    const { endpoints } = federalRegisterPlugin.describe();
    console.log("Usage: federal-register <endpoint> [--param value ...]\n");
    console.log("Endpoints:");
    for (const ep of endpoints) {
      console.log(`  ${ep.name.padEnd(30)} ${ep.description}`);
      if (ep.params.length > 0) {
        const paramList = ep.params.map(p => {
          const flag = `--${p.name.replace(/_/g, "-")}`;
          return p.required ? flag : `[${flag}]`;
        });
        console.log(`    ${paramList.join(" ")}`);
      }
    }
    process.exit(0);
  }

  // Prepend the plugin prefix so dispatch can find it
  const result = await dispatch([federalRegisterPlugin], ["federal-register", ...filteredArgs]);

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
