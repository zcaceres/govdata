import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { timeseries, surveys, popular, describe } from "./endpoints";
import type { BlsResult } from "./response";

const server = new McpServer({ name: "bls-api", version: "0.1.0" });

const endpointFns: Record<string, (params?: any) => Promise<BlsResult>> = {
  timeseries,
  surveys,
  popular,
};

function formatResult(result: BlsResult, format: string): string {
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

for (const endpoint of describe().endpoints) {
  const fn = endpointFns[endpoint.name];
  if (!fn) continue;

  const schemaShape: Record<string, z.ZodTypeAny> = {};
  for (const param of endpoint.params) {
    let schema: z.ZodTypeAny;
    if (param.values) {
      schema = z.enum(param.values as [string, ...string[]]);
    } else if (param.type === "number") {
      schema = z.number().int();
    } else if (param.type === "boolean") {
      schema = z.boolean();
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
    `bls_${endpoint.name}`,
    endpoint.description,
    schemaShape,
    async (args) => {
      try {
        const { format, ...params } = args;
        const hasParams = Object.keys(params).length > 0;
        const result = await fn(hasParams ? params : undefined);
        return { content: [{ type: "text" as const, text: formatResult(result, format as string) }] };
      } catch (err: unknown) {
        return { content: [{ type: "text" as const, text: String((err as Error).message ?? err) }], isError: true };
      }
    },
  );
}

server.tool("bls_describe", "Describe all available BLS API endpoints, parameters, and response fields", {}, async () => {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(describe(), null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
