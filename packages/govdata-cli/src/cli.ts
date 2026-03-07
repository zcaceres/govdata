#!/usr/bin/env bun
import { dispatch } from "govdata-core";
import type { GovDataPlugin } from "govdata-core";
import { dogePlugin } from "doge-api";

const plugins: GovDataPlugin[] = [dogePlugin];

async function main() {
  const args = process.argv.slice(2);

  const jsonFlag = args.includes("--json");
  const filteredArgs = args.filter((a) => a !== "--json");

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
  process.exit(1);
});
