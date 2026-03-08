#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AGENCIES, type Agency, type EndpointFor, toKey } from "./datasets.js";
import { createClient, listDatasets } from "./client.js";
import { createDescribe } from "./describe.js";
import { wrapResponse, type DOLResult } from "./response.js";

const apiKey = process.env.DOL_API_KEY;
if (!apiKey) {
  console.error("DOL_API_KEY environment variable is required");
  process.exit(1);
}

const client = createClient({ apiKey });
const describeFn = createDescribe({
  getMetadata: client.getMetadata,
  listDatasets: () => listDatasets(),
});

const server = new McpServer({ name: "dol-api", version: "0.1.0" });

function formatResult(result: DOLResult, format: string): string {
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

const queryParams = {
  limit: z.number().int().positive().optional().describe("Maximum rows to return (1-10000)"),
  offset: z.number().int().min(0).optional().describe("Row offset for pagination"),
  sort: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
  sort_by: z.string().optional().describe("Column name to sort by"),
};

// Register a tool for each agency/endpoint combination
for (const [agency, endpoints] of Object.entries(AGENCIES)) {
  for (const endpoint of endpoints) {
    const toolName = `dol_${agency.toLowerCase()}_${toKey(endpoint)}`;
    const description = `Fetch data from the DOL ${agency} ${endpoint} dataset`;

    const schemaShape: Record<string, z.ZodTypeAny> = { ...queryParams, ...formatParam };
    server.tool(
      toolName,
      description,
      schemaShape,
      async (args) => {
        const { format, ...params } = args;
        const hasParams = Object.keys(params).length > 0;
        const result = await client.getData(
          agency as Agency,
          endpoint as EndpointFor<Agency>,
          hasParams ? (params as any) : undefined,
        );
        const wrapped = wrapResponse(result, agency, endpoint);
        return {
          content: [{ type: "text" as const, text: formatResult(wrapped, format as string) }],
        };
      },
    );
  }
}

// Register describe tool for each agency/endpoint
for (const [agency, endpoints] of Object.entries(AGENCIES)) {
  for (const endpoint of endpoints) {
    const toolName = `dol_describe_${agency.toLowerCase()}_${toKey(endpoint)}`;
    const description = `Describe the DOL ${agency} ${endpoint} dataset — columns, types, and metadata`;

    server.tool(toolName, description, {}, async () => {
      const desc = await describeFn(
        agency as Agency,
        endpoint as EndpointFor<Agency>,
      );
      return {
        content: [{ type: "text" as const, text: desc.textSummary }],
      };
    });
  }
}

// Register a tool to list all available datasets
server.tool(
  "dol_list_datasets",
  "List all available DOL datasets with agency, endpoint name, and description",
  {},
  async () => {
    const result = await listDatasets();
    const lines: string[] = [];
    for (const ds of result.datasets) {
      lines.push(`${ds.agency.abbr}/${ds.api_url} — ${ds.name}`);
    }
    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
    };
  },
);

// Register a describe-all tool
server.tool(
  "dol_describe",
  "List all available DOL API endpoints with their agency, endpoint name, and tool names",
  {},
  async () => {
    const entries: string[] = [];
    for (const [agency, endpoints] of Object.entries(AGENCIES)) {
      for (const endpoint of endpoints) {
        entries.push(
          `Tool: dol_${agency.toLowerCase()}_${toKey(endpoint)} — ${agency}/${endpoint}`,
        );
      }
    }
    return {
      content: [{
        type: "text" as const,
        text: `Available DOL API tools (${entries.length} datasets across ${Object.keys(AGENCIES).length} agencies):\n\n${entries.join("\n")}`,
      }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
