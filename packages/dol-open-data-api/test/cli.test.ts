import { describe, expect, test } from "bun:test";
import { resolve } from "path";

const CLI = resolve(import.meta.dir, "../bin/cli.ts");

async function runCli(args: string[], env?: Record<string, string>): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["bun", "run", CLI, ...args], {
    env: { ...process.env, ...env },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

describe("CLI", () => {
  test("--help prints usage and exits 0", async () => {
    const { stdout, exitCode } = await runCli(["--help"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("dol-api setup");
    expect(stdout).toContain("dol-api datasets");
    expect(stdout).toContain("dol-api get");
    expect(stdout).toContain("dol-api metadata");
    expect(stdout).toContain("dol-api describe");
    expect(stdout).toContain("--format");
    expect(stdout).toContain("--summary");
    expect(stdout).toContain("Agencies:");
  });

  test("-h prints usage and exits 0", async () => {
    const { stdout, exitCode } = await runCli(["-h"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("dol-api datasets");
  });

  test("no args prints usage and exits 1", async () => {
    const { stdout, exitCode } = await runCli([]);
    expect(exitCode).toBe(1);
    expect(stdout).toContain("Usage:");
  });

  test("unknown command exits 1", async () => {
    const { stderr, exitCode } = await runCli(["bogus"], { DOL_API_KEY: "fake" });
    expect(exitCode).toBe(1);
    expect(stderr).toContain("Unknown command: bogus");
  });

  test("get without api key exits 1", async () => {
    const { stderr, exitCode } = await runCli(["get", "MSHA", "accident"], { DOL_API_KEY: "" });
    expect(exitCode).toBe(1);
    expect(stderr).toContain("API key required");
  });

  test("get without agency/endpoint exits 1", async () => {
    const { stderr, exitCode } = await runCli(["get"], { DOL_API_KEY: "fake" });
    expect(exitCode).toBe(1);
    expect(stderr).toContain("agency and endpoint are required");
  });

  test("get with invalid agency exits 1", async () => {
    const { stderr, exitCode } = await runCli(["get", "FAKE", "test"], { DOL_API_KEY: "fake" });
    expect(exitCode).toBe(1);
    expect(stderr).toContain('unknown agency "FAKE"');
  });

  test("metadata without api key exits 1", async () => {
    const { stderr, exitCode } = await runCli(["metadata", "MSHA", "accident"], { DOL_API_KEY: "" });
    expect(exitCode).toBe(1);
    expect(stderr).toContain("API key required");
  });

  test("describe without api key exits 1", async () => {
    const { stderr, exitCode } = await runCli(["describe", "MSHA", "accident"], { DOL_API_KEY: "" });
    expect(exitCode).toBe(1);
    expect(stderr).toContain("API key required");
  });

  test("setup without key prints usage", async () => {
    const { stderr, exitCode } = await runCli(["setup"]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("dol-api setup");
    expect(stderr).toContain("data.dol.gov");
  });

  test("datasets command makes live call", async () => {
    const { stdout, exitCode } = await runCli(["datasets"]);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed).toHaveProperty("datasets");
    expect(parsed).toHaveProperty("meta");
    expect(parsed.datasets.length).toBeGreaterThan(0);
    expect(parsed.datasets[0]).toHaveProperty("agency");
  }, 15000);
});
