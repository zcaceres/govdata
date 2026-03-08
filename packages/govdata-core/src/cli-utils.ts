import type { GovDataPlugin } from "./plugin";
import type { GovResult } from "./response";

export class GovHelpText extends Error {
  name = "GovHelpText";
}

export function kebabToSnake(str: string): string {
  return str.replace(/-/g, "_");
}

export function parseFlags(args: string[]): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;
    const key = kebabToSnake(arg.slice(2));
    const next = args[i + 1];
    if (next === undefined || next.startsWith("--")) {
      result[key] = true;
    } else {
      const num = Number(next);
      result[key] = Number.isFinite(num) && next.trim() !== "" ? num : next;
      i++;
    }
  }
  return result;
}

export async function dispatch(
  plugins: GovDataPlugin[],
  args: string[],
): Promise<GovResult> {
  const pluginName = args[0];
  const endpointName = args[1];
  const flagArgs = args.slice(2);

  if (!pluginName) {
    const names = plugins.map((p) => p.prefix).join(", ");
    throw new GovHelpText(`Usage: govdata <source> <endpoint> [options]\nSources: ${names}`);
  }

  const plugin = plugins.find((p) => p.prefix === pluginName);
  if (!plugin) {
    const names = plugins.map((p) => p.prefix).join(", ");
    throw new Error(`Unknown source '${pluginName}'. Available: ${names}`);
  }

  if (!endpointName || endpointName === "--help" || flagArgs.includes("--help")) {
    const { endpoints } = plugin.describe();
    const lines = [`Usage: govdata ${pluginName} <endpoint> [--param value ...]\n`, "Endpoints:"];
    for (const ep of endpoints) {
      lines.push(`  ${ep.name.padEnd(30)} ${ep.description}`);
    }
    throw new GovHelpText(lines.join("\n"));
  }

  const endpoint = plugin.endpoints[endpointName];
  if (!endpoint) {
    const endpoints = plugin.describe().endpoints.map((e) => e.name).join(", ");
    throw new Error(`Unknown endpoint '${endpointName}'. Available: ${endpoints}`);
  }

  const params = parseFlags(flagArgs);
  const hasParams = Object.keys(params).length > 0;
  return endpoint(hasParams ? params : undefined);
}
