import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildSchemaFromParams } from "govdata-core";
import { blsPlugin } from "./plugin";
import { describe } from "./endpoints";
import type { BlsResult } from "./response";

const server = new McpServer({ name: "bls-api", version: "0.1.0" });

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
  const fn = blsPlugin.endpoints[endpoint.name];
  if (!fn) continue;

  const schemaShape = buildSchemaFromParams(endpoint.params);
  Object.assign(schemaShape, formatParam);

  server.tool(
    `bls_${endpoint.name}`,
    endpoint.description,
    schemaShape,
    async (args) => {
      try {
        const { format, ...params } = args;
        // Split comma/space-separated series_id for MCP callers (defense-in-depth, plugin.ts also handles this)
        if (typeof params.series_id === "string") {
          if (params.series_id.includes(",")) {
            (params as any).series_id = params.series_id.split(",").map((s: string) => s.trim()).filter(Boolean);
          } else if (params.series_id.includes(" ")) {
            (params as any).series_id = params.series_id.split(/\s+/).filter(Boolean);
          }
        }
        const hasParams = Object.keys(params).length > 0;
        const result = await fn(hasParams ? params : undefined) as BlsResult;
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
