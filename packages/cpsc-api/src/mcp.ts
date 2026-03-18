import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildSchemaFromParams } from "govdata-core";
import { cpscPlugin } from "./plugin";
import { describe } from "./endpoints";
import type { CpscResult } from "./response";

const server = new McpServer({ name: "cpsc-api", version: "0.1.0" });

function formatResult(result: CpscResult, format: string): string {
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
  const fn = cpscPlugin.endpoints[endpoint.name];
  if (!fn) continue;

  const schemaShape = buildSchemaFromParams(endpoint.params);
  Object.assign(schemaShape, formatParam);

  server.tool(
    `cpsc_${endpoint.name}`,
    endpoint.description,
    schemaShape,
    async (args) => {
      try {
        const { format, ...params } = args;
        const hasParams = Object.keys(params).length > 0;
        const result = await fn(hasParams ? params : undefined) as CpscResult;
        return { content: [{ type: "text" as const, text: formatResult(result, format as string) }] };
      } catch (err: unknown) {
        return { content: [{ type: "text" as const, text: String((err as Error).message ?? err) }], isError: true };
      }
    },
  );
}

server.tool("cpsc_describe", "Describe all available CPSC API endpoints, parameters, and response fields", {}, async () => {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(describe(), null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
