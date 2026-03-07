import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { grants, contracts, leases, payments, statistics, describe } from "./endpoints";
import type { DogeResult } from "./response";

const server = new McpServer({ name: "doge-api", version: "0.1.0" });

const endpointFns: Record<string, (params?: any) => Promise<DogeResult>> = {
  grants,
  contracts,
  leases,
  payments,
  statistics,
};

function formatResult(result: DogeResult, format: string): string {
  switch (format) {
    case "csv":
      return result.toCSV();
    case "json":
      return JSON.stringify(result.data);
    default:
      return result.toMarkdown();
  }
}

const formatParam = {
  format: z
    .enum(["markdown", "csv", "json"])
    .default("markdown")
    .describe("Output format"),
};

// Register tools dynamically from describe() metadata
for (const endpoint of describe().endpoints) {
  const fn = endpointFns[endpoint.name];
  if (!fn) continue;

  const schemaShape: Record<string, z.ZodTypeAny> = {};
  for (const param of endpoint.params) {
    let schema: z.ZodTypeAny;
    if (param.values) {
      schema = z.enum(param.values as [string, ...string[]]);
    } else if (param.type === "number") {
      schema = z.number().int().positive();
    } else {
      schema = z.string();
    }
    if (!param.required) {
      schema = schema.optional();
    }
    schemaShape[param.name] = schema.describe(
      param.values ? `One of: ${param.values.join(", ")}` : param.type,
    );
  }

  Object.assign(schemaShape, formatParam);

  server.tool(
    `doge_${endpoint.name}`,
    endpoint.description,
    schemaShape,
    async (args) => {
      const { format, ...params } = args;
      const hasParams = Object.keys(params).length > 0;
      const result = await fn(hasParams ? params : undefined);
      return { content: [{ type: "text" as const, text: formatResult(result, format as string) }] };
    },
  );
}

// Register describe tool separately
server.tool("doge_describe", "Describe all available DOGE API endpoints, parameters, and response fields", {}, async () => {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(describe(), null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
