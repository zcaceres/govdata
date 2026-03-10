import { describe, it, expect } from "bun:test";

describe("CLI", () => {
  it("--help exits 0 and lists endpoints", async () => {
    const proc = Bun.spawn(["bun", "run", "src/cli.ts", "--help"], {
      cwd: new URL("..", import.meta.url).pathname,
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await proc.exited;
    const stdout = await new Response(proc.stdout).text();

    expect(exitCode).toBe(0);
    expect(stdout).toContain("timeseries");
    expect(stdout).toContain("surveys");
    expect(stdout).toContain("popular");
    expect(stdout).toContain("Usage:");
  });

  it("no args exits 0 and shows help", async () => {
    const proc = Bun.spawn(["bun", "run", "src/cli.ts"], {
      cwd: new URL("..", import.meta.url).pathname,
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await proc.exited;
    const stdout = await new Response(proc.stdout).text();

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Usage:");
  });
});
