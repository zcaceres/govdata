import { describe, it, expect } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GrantsResponseSchema,
  ContractsResponseSchema,
  LeasesResponseSchema,
  PaymentsResponseSchema,
  StatisticsResponseSchema,
} from "../src/schemas";
import { z } from "zod";

const fixturesDir = join(import.meta.dir, "../fixtures");

function loadFixture(name: string): unknown | null {
  const path = join(fixturesDir, `${name}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function testFixture(name: string, schema: z.ZodType) {
  it(`validates ${name} fixture`, () => {
    const data = loadFixture(name);
    if (!data) return;
    expect(() => schema.parse(data)).not.toThrow();
  });
}

describe("grants schema against fixtures", () => {
  testFixture("grants", GrantsResponseSchema);
  testFixture("grants-sorted", GrantsResponseSchema);
  testFixture("grants-page2", GrantsResponseSchema);
});

describe("contracts schema against fixtures", () => {
  testFixture("contracts", ContractsResponseSchema);
  testFixture("contracts-sorted", ContractsResponseSchema);
});

describe("leases schema against fixtures", () => {
  testFixture("leases", LeasesResponseSchema);
  testFixture("leases-sorted", LeasesResponseSchema);
});

describe("payments schema against fixtures", () => {
  testFixture("payments", PaymentsResponseSchema);
  testFixture("payments-sorted", PaymentsResponseSchema);
  testFixture("payments-filtered", PaymentsResponseSchema);
});

describe("statistics schema against fixtures", () => {
  testFixture("statistics", StatisticsResponseSchema);
});
