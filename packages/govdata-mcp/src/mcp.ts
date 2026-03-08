#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildSchemaFromParams } from "govdata-core";
import type { GovDataPlugin, GovResult } from "govdata-core";
import { dogePlugin } from "doge-api";
import { naicsPlugin } from "naics-api";
import { dolPlugin } from "dol-open-data-api";
import { federalRegisterPlugin } from "federal-register";
import { usaspendingPlugin } from "usaspending-api";

const plugins: GovDataPlugin[] = [dogePlugin, naicsPlugin, dolPlugin, federalRegisterPlugin, usaspendingPlugin];

const server = new McpServer({ name: "govdata", version: "0.1.0" });

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
    .default("markdown")
    .describe("Output format"),
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
        try {
          const { format, ...params } = args;
          const hasParams = Object.keys(params).length > 0;
          const result = await fn(hasParams ? params : undefined);
          return {
            content: [{ type: "text" as const, text: formatResult(result, format as string) }],
          };
        } catch (err: unknown) {
          return { content: [{ type: "text" as const, text: String((err as Error).message ?? err) }], isError: true };
        }
      },
    );
  }

  server.tool(
    `${plugin.prefix}_describe`,
    `Describe all available ${plugin.prefix.toUpperCase()} API endpoints, parameters, and response fields`,
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
