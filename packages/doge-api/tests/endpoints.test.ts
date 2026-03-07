import { describe, it, expect, afterEach } from "bun:test";
import {
  grants,
  contracts,
  leases,
  payments,
  statistics,
  doge,
  createDoge,
} from "../src/endpoints";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(body: unknown) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
}

const meta = { total_results: 1, pages: 1 };

describe("endpoint functions", () => {
  it("grants returns parsed grants", async () => {
    const fixture = {
      success: true,
      result: {
        grants: [
          {
            date: "10/2/2025",
            agency: "DOE",
            recipient: "Test",
            value: 5000,
            savings: 1000,
            link: null,
            description: "Test grant",
          },
        ],
      },
      meta,
    };
    mockFetch(fixture);
    const result = await grants({ sort_by: "savings" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].agency).toBe("DOE");
    expect(result.meta).toEqual(meta);
    expect(result.kind).toBe("grants");
  });

  it("contracts returns parsed contracts", async () => {
    const fixture = {
      success: true,
      result: {
        contracts: [
          {
            piid: "N001",
            agency: "Navy",
            vendor: "Acme",
            value: 2000,
            description: "Test contract",
            fpds_status: "ACTIVE",
            fpds_link: null,
            deleted_date: "10/3/2025",
            savings: 500,
          },
        ],
      },
      meta,
    };
    mockFetch(fixture);
    const result = await contracts();
    expect(result.data[0].vendor).toBe("Acme");
  });

  it("leases returns parsed leases", async () => {
    const fixture = {
      success: true,
      result: {
        leases: [
          {
            date: "8/28/2025",
            location: "DC",
            sq_ft: 5000,
            description: "Terminated",
            value: 12000,
            savings: 300,
            agency: "GSA",
          },
        ],
      },
      meta,
    };
    mockFetch(fixture);
    const result = await leases();
    expect(result.data[0].location).toBe("DC");
  });

  it("payments returns parsed payments", async () => {
    const fixture = {
      success: true,
      result: {
        payments: [
          {
            payment_date: "05/13/2025",
            payment_amt: 999,
            agency_name: "NASA",
            award_description: "Test",
            fain: null,
            recipient_justification: "Test",
            agency_lead_justification: "Approved",
            org_name: "HQ",
            generated_unique_award_id: null,
          },
        ],
      },
      meta,
    };
    mockFetch(fixture);
    const result = await payments({ filter: "agency_name", filter_value: "NASA" });
    expect(result.data[0].payment_amt).toBe(999);
  });

  it("statistics returns parsed statistics", async () => {
    const fixture = {
      success: true,
      result: {
        agency: [{ agency_name: "NASA", count: 100 }],
        request_date: [{ date: "2025-01-01", count: 50 }],
        org_names: [{ org_name: "HQ", count: 25 }],
      },
    };
    mockFetch(fixture);
    const result = await statistics();
    expect(result.data.agency[0].agency_name).toBe("NASA");
    expect(result.data.agency).toHaveLength(1);
    expect(result.summary()).toContain("statistics");
  });

  it("rejects invalid enum with DogeValidationError", async () => {
    const { DogeValidationError } = await import("../src/errors");
    try {
      await grants({ sort_by: "invalid" as any });
      expect(true).toBe(false); // should not reach
    } catch (err) {
      expect(err).toBeInstanceOf(DogeValidationError);
      expect((err as InstanceType<typeof DogeValidationError>).field).toBe("sort_by");
      expect((err as InstanceType<typeof DogeValidationError>).received).toBe("invalid");
      expect((err as InstanceType<typeof DogeValidationError>).expected).toContain("savings");
    }
  });

  it("rejects invalid type with DogeValidationError", async () => {
    const { DogeValidationError } = await import("../src/errors");
    try {
      await grants({ page: "not a number" as unknown as number });
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(DogeValidationError);
      expect((err as InstanceType<typeof DogeValidationError>).field).toBe("page");
    }
  });

  it("grants has formatting helpers", async () => {
    const fixture = {
      success: true,
      result: {
        grants: [
          { date: null, agency: "DOE", recipient: null, value: 5000, savings: 1000, link: null, description: null },
        ],
      },
      meta,
    };
    mockFetch(fixture);
    const result = await grants();
    expect(result.summary()).toContain("grants");
    expect(result.toMarkdown()).toContain("DOE");
    expect(result.toCSV()).toContain("DOE");
  });
});

describe("doge namespace object", () => {
  it("doge.grants works like standalone grants", async () => {
    const fixture = {
      success: true,
      result: {
        grants: [
          {
            date: "10/2/2025",
            agency: "DOE",
            recipient: "Test",
            value: 5000,
            savings: 1000,
            link: null,
            description: "Test grant",
          },
        ],
      },
      meta,
    };
    mockFetch(fixture);
    const result = await doge.grants({ sort_by: "savings" });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].agency).toBe("DOE");
  });

  it("doge.statistics works", async () => {
    const fixture = {
      success: true,
      result: {
        agency: [{ agency_name: "NASA", count: 100 }],
        request_date: [{ date: "2025-01-01", count: 50 }],
        org_names: [{ org_name: "HQ", count: 25 }],
      },
    };
    mockFetch(fixture);
    const result = await doge.statistics();
    expect(result.data.agency[0].agency_name).toBe("NASA");
  });
});

describe("createDoge factory", () => {
  it("creates a client with all methods and describe", () => {
    const client = createDoge({ maxRetries: 5 });
    expect(typeof client.grants).toBe("function");
    expect(typeof client.contracts).toBe("function");
    expect(typeof client.leases).toBe("function");
    expect(typeof client.payments).toBe("function");
    expect(typeof client.statistics).toBe("function");
    expect(typeof client.describe).toBe("function");
  });

  it("client methods work correctly", async () => {
    const fixture = {
      success: true,
      result: {
        grants: [
          {
            date: "10/2/2025",
            agency: "DOE",
            recipient: "Test",
            value: 5000,
            savings: 1000,
            link: null,
            description: "Test grant",
          },
        ],
      },
      meta,
    };
    mockFetch(fixture);
    const client = createDoge({ maxRetries: 1 });
    const result = await client.grants({ per_page: 10 });
    expect(result.data[0].agency).toBe("DOE");
  });
});
