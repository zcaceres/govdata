#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildSchemaFromParams } from "govdata-core";
import type { GovDataPlugin, GovResult } from "govdata-core";
import { naicsPlugin } from "./plugin";

const plugins: GovDataPlugin[] = [naicsPlugin];

const server = new McpServer({ name: "naics", version: "1.0.0" });

function formatResult(result: GovResult, format: string): string {
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
    .optional()
    .describe("Output format (default: markdown)"),
};

for (const plugin of plugins) {
  const { endpoints } = plugin.describe();

  for (const endpoint of endpoints) {
    const fn = plugin.endpoints[endpoint.name];
    if (!fn) continue;

    const schemaShape = buildSchemaFromParams(endpoint.params);
    Object.assign(schemaShape, formatParam);

    server.tool(
      `${plugin.prefix}_${endpoint.name}`,
      endpoint.description,
      schemaShape,
      async (args) => {
        const { format, ...params } = args;
        const hasParams = Object.keys(params).length > 0;
        const result = await fn(hasParams ? params : undefined);
        return {
          content: [{ type: "text" as const, text: formatResult(result, (format as string) ?? "markdown") }],
        };
      },
    );
  }

  server.tool(
    `${plugin.prefix}_describe`,
    `Describe all available ${plugin.prefix.toUpperCase()} endpoints, parameters, and response fields`,
    {},
    async () => {
      return {
        content: [{ type: "text" as const, text: JSON.stringify(plugin.describe(), null, 2) }],
      };
    },
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
