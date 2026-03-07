#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { SavingsParamsSchema, PaymentsParamsSchema } from "./schemas";
import {
  grants,
  contracts,
  leases,
  payments,
  statistics,
} from "./endpoints";

const COMMANDS = ["grants", "contracts", "leases", "payments", "statistics"] as const;
type Command = (typeof COMMANDS)[number];

function isCommand(value: string): value is Command {
  return (COMMANDS as readonly string[]).includes(value);
}

function usage(): never {
  console.log(`Usage: doge-api <command> [options]

Commands:
  grants       List cancelled grants
  contracts    List cancelled contracts
  leases       List cancelled leases
  payments     List payments
  statistics   Payment statistics

Options:
  --sort-by <field>        Sort field (savings|value|date for savings; amount|date for payments)
  --sort-order <asc|desc>  Sort order
  --page <n>               Page number
  --per-page <n>           Results per page
  --filter <field>         Filter field (payments only)
  --filter-value <value>   Filter value (payments only)
  --json                   Pretty-print JSON output`);
  process.exit(1);
}

async function main() {
  const command = process.argv[2];
  if (!command || !isCommand(command)) {
    usage();
  }

  const { values } = parseArgs({
    args: process.argv.slice(3),
    options: {
      "sort-by": { type: "string" },
      "sort-order": { type: "string" },
      page: { type: "string" },
      "per-page": { type: "string" },
      filter: { type: "string" },
      "filter-value": { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: true,
  });

  const rawParams = {
    sort_by: values["sort-by"],
    sort_order: values["sort-order"],
    page: values.page ? parseInt(values.page, 10) : undefined,
    per_page: values["per-page"]
      ? parseInt(values["per-page"], 10)
      : undefined,
  };

  let result: unknown;

  switch (command) {
    case "grants": {
      const params = SavingsParamsSchema.parse(rawParams);
      result = await grants(params);
      break;
    }
    case "contracts": {
      const params = SavingsParamsSchema.parse(rawParams);
      result = await contracts(params);
      break;
    }
    case "leases": {
      const params = SavingsParamsSchema.parse(rawParams);
      result = await leases(params);
      break;
    }
    case "payments": {
      const params = PaymentsParamsSchema.parse({
        ...rawParams,
        filter: values.filter,
        filter_value: values["filter-value"],
      });
      result = await payments(params);
      break;
    }
    case "statistics":
      result = await statistics();
      break;
  }

  const indent = values.json ? 2 : undefined;
  console.log(JSON.stringify(result, null, indent));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
