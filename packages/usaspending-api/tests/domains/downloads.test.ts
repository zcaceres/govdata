import { describe, it, expect, afterEach } from "bun:test";
import {
  _downloadCount,
  _downloadAwards,
  _downloadTransactions,
  _downloadIdv,
  _downloadContract,
  _downloadAssistance,
  _downloadStatus,
  _downloadDisaster,
  _bulkDownloadListAgenciesAccounts,
  _bulkDownloadListAgenciesAwards,
  _bulkDownloadListMonthlyFiles,
  _bulkDownloadAwards,
  _bulkDownloadStatus,
  DownloadCountResponseSchema,
  DownloadGenerationResponseSchema,
  DownloadStatusResponseSchema,
  BulkDownloadListAgenciesResponseSchema,
  BulkDownloadListMonthlyFilesResponseSchema,
  downloadsEndpoints,
} from "../../src/domains/downloads";
import type { DownloadsKindMap } from "../../src/domains/downloads";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(fixture: string) {
  globalThis.fetch = (async () => {
    const data = await Bun.file(`${import.meta.dir}/../../fixtures/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
}

function mockFetchCapture(fixture: string) {
  let captured: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    captured = { url, init };
    const data = await Bun.file(`${import.meta.dir}/../../fixtures/${fixture}`).json();
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
  return () => captured;
}

function mockFetchJson(data: unknown) {
  globalThis.fetch = (async () => {
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
}

function mockFetchJsonCapture(data: unknown) {
  let captured: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    captured = { url, init };
    return new Response(JSON.stringify(data), { status: 200 });
  }) as unknown as typeof fetch;
  return () => captured;
}

const downloadGenerationMock = {
  status_url: "/api/v2/download/status/?file_name=test.zip",
  file_name: "test.zip",
  file_url: "/download/test.zip",
  download_request_id: "abc-123",
  status: "ready",
  message: null,
};

const downloadStatusMock = {
  status: "finished",
  status_url: "/api/v2/download/status/?file_name=test.zip",
  file_name: "test.zip",
  file_url: "/download/test.zip",
  download_request_id: "abc-123",
  message: null,
  seconds_elapsed: "5.2",
  total_rows: 100,
  total_columns: 15,
};

describe("downloads domain", () => {
  describe("_downloadCount", () => {
    it("returns download count data", async () => {
      mockFetch("downloads/count.json");
      const result = await _downloadCount({ filters: { keywords: ["test"] } });
      expect(result.kind).toBe("download_count");
      expect(result.data.calculated_transaction_count).toBe(3459);
      expect(result.data.maximum_transaction_limit).toBe(500000);
      expect(result.data.transaction_rows_gt_limit).toBe(false);
      expect(result.meta).toBeNull();
    });

    it("sends POST request with filters", async () => {
      const getCapture = mockFetchCapture("downloads/count.json");
      await _downloadCount({ filters: { keywords: ["defense"] } });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/download/count/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filters.keywords).toEqual(["defense"]);
    });
  });

  describe("_downloadAwards", () => {
    it("returns download generation response", async () => {
      mockFetchJson(downloadGenerationMock);
      const result = await _downloadAwards({ filters: { keywords: ["test"] } });
      expect(result.kind).toBe("download_awards");
      expect(result.data.status_url).toBe("/api/v2/download/status/?file_name=test.zip");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.meta).toBeNull();
    });

    it("sends POST request with filters and optional params", async () => {
      const getCapture = mockFetchJsonCapture(downloadGenerationMock);
      await _downloadAwards({ filters: { keywords: ["test"] }, columns: ["col1", "col2"], file_format: "tsv" });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/download/awards/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filters.keywords).toEqual(["test"]);
      expect(body.columns).toEqual(["col1", "col2"]);
      expect(body.file_format).toBe("tsv");
    });
  });

  describe("_downloadTransactions", () => {
    it("returns download generation response", async () => {
      mockFetchJson(downloadGenerationMock);
      const result = await _downloadTransactions({ filters: { keywords: ["test"] } });
      expect(result.kind).toBe("download_transactions");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.meta).toBeNull();
    });

    it("sends POST to correct URL", async () => {
      const getCapture = mockFetchJsonCapture(downloadGenerationMock);
      await _downloadTransactions({ filters: { keywords: ["test"] } });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/download/transactions/");
    });
  });

  describe("_downloadIdv", () => {
    it("returns download generation response", async () => {
      mockFetchJson(downloadGenerationMock);
      const result = await _downloadIdv({ award_id: 12345 });
      expect(result.kind).toBe("download_idv");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.meta).toBeNull();
    });

    it("sends POST with award_id", async () => {
      const getCapture = mockFetchJsonCapture(downloadGenerationMock);
      await _downloadIdv({ award_id: 12345, file_format: "csv" });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/download/idv/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.award_id).toBe(12345);
      expect(body.file_format).toBe("csv");
    });
  });

  describe("_downloadContract", () => {
    it("returns download generation response", async () => {
      mockFetchJson(downloadGenerationMock);
      const result = await _downloadContract({ award_id: 67890 });
      expect(result.kind).toBe("download_contract");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.meta).toBeNull();
    });

    it("sends POST with award_id", async () => {
      const getCapture = mockFetchJsonCapture(downloadGenerationMock);
      await _downloadContract({ award_id: 67890 });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/download/contract/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.award_id).toBe(67890);
    });
  });

  describe("_downloadAssistance", () => {
    it("returns download generation response", async () => {
      mockFetchJson(downloadGenerationMock);
      const result = await _downloadAssistance({ award_id: 11111 });
      expect(result.kind).toBe("download_assistance");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.meta).toBeNull();
    });

    it("sends POST with award_id and optional columns", async () => {
      const getCapture = mockFetchJsonCapture(downloadGenerationMock);
      await _downloadAssistance({ award_id: 11111, columns: ["a", "b"] });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/download/assistance/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.award_id).toBe(11111);
      expect(body.columns).toEqual(["a", "b"]);
    });
  });

  describe("_downloadStatus", () => {
    it("returns download status", async () => {
      mockFetchJson(downloadStatusMock);
      const result = await _downloadStatus("test.zip");
      expect(result.kind).toBe("download_status");
      expect(result.data.status).toBe("finished");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.data.total_rows).toBe(100);
      expect(result.meta).toBeNull();
    });

    it("uses GET request with file_name query param", async () => {
      const getCapture = mockFetchJsonCapture(downloadStatusMock);
      await _downloadStatus("my-download.zip");
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/download/status/");
      expect(captured!.url).toContain("file_name=my-download.zip");
    });
  });

  describe("_downloadDisaster", () => {
    it("returns download generation response", async () => {
      mockFetchJson(downloadGenerationMock);
      const result = await _downloadDisaster({ filters: { def_codes: ["L", "M"] } });
      expect(result.kind).toBe("download_disaster");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.meta).toBeNull();
    });

    it("sends POST with def_codes in filters", async () => {
      const getCapture = mockFetchJsonCapture(downloadGenerationMock);
      await _downloadDisaster({ filters: { def_codes: ["L", "M", "N"] } });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/download/disaster/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filters.def_codes).toEqual(["L", "M", "N"]);
    });
  });

  describe("_bulkDownloadListAgenciesAccounts", () => {
    it("returns agencies list", async () => {
      mockFetch("bulk-downloads/list-agencies-accounts.json");
      const result = await _bulkDownloadListAgenciesAccounts();
      expect(result.kind).toBe("bulk_download_list_agencies_accounts");
      expect(result.data.agencies).toBeDefined();
      expect(result.data.agencies.cfo_agencies).toBeInstanceOf(Array);
      expect(result.data.agencies.cfo_agencies.length).toBeGreaterThan(0);
      expect(result.meta).toBeNull();
    });

    it("sends POST with type account_agencies", async () => {
      const getCapture = mockFetchCapture("bulk-downloads/list-agencies-accounts.json");
      await _bulkDownloadListAgenciesAccounts();
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/bulk_download/list_agencies/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.type).toBe("account_agencies");
    });
  });

  describe("_bulkDownloadListAgenciesAwards", () => {
    it("returns agencies list", async () => {
      mockFetch("bulk-downloads/list-agencies-awards.json");
      const result = await _bulkDownloadListAgenciesAwards();
      expect(result.kind).toBe("bulk_download_list_agencies_awards");
      expect(result.data.agencies).toBeDefined();
      expect(result.data.agencies.cfo_agencies).toBeInstanceOf(Array);
      expect(result.data.agencies.other_agencies).toBeInstanceOf(Array);
      expect(result.meta).toBeNull();
    });

    it("sends POST with type award_agencies", async () => {
      const getCapture = mockFetchCapture("bulk-downloads/list-agencies-awards.json");
      await _bulkDownloadListAgenciesAwards();
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/bulk_download/list_agencies/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.type).toBe("award_agencies");
    });
  });

  describe("_bulkDownloadListMonthlyFiles", () => {
    it("returns monthly files list", async () => {
      mockFetch("bulk-downloads/list-monthly-files.json");
      const result = await _bulkDownloadListMonthlyFiles({ agency: "all" as any, fiscal_year: 2024, type: "contracts" });
      expect(result.kind).toBe("bulk_download_list_monthly_files");
      expect(result.data.monthly_files).toBeInstanceOf(Array);
      expect(result.meta).toBeNull();
    });

    it("sends POST with agency, fiscal_year, type", async () => {
      const getCapture = mockFetchCapture("bulk-downloads/list-monthly-files.json");
      await _bulkDownloadListMonthlyFiles({ agency: 14, fiscal_year: 2024, type: "assistance" });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/bulk_download/list_monthly_files/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.agency).toBe(14);
      expect(body.fiscal_year).toBe(2024);
      expect(body.type).toBe("assistance");
    });
  });

  describe("_bulkDownloadAwards", () => {
    it("returns download generation response", async () => {
      mockFetchJson(downloadGenerationMock);
      const result = await _bulkDownloadAwards({ filters: { keywords: ["test"] } });
      expect(result.kind).toBe("bulk_download_awards");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.meta).toBeNull();
    });

    it("sends POST with filters and optional file_format", async () => {
      const getCapture = mockFetchJsonCapture(downloadGenerationMock);
      await _bulkDownloadAwards({ filters: { keywords: ["defense"] }, file_format: "tsv" });
      const captured = getCapture();
      expect(captured!.init?.method).toBe("POST");
      expect(captured!.url).toContain("/api/v2/bulk_download/awards/");
      const body = JSON.parse(captured!.init?.body as string);
      expect(body.filters.keywords).toEqual(["defense"]);
      expect(body.file_format).toBe("tsv");
    });
  });

  describe("_bulkDownloadStatus", () => {
    it("returns download status", async () => {
      mockFetchJson(downloadStatusMock);
      const result = await _bulkDownloadStatus("bulk-test.zip");
      expect(result.kind).toBe("bulk_download_status");
      expect(result.data.status).toBe("finished");
      expect(result.data.file_name).toBe("test.zip");
      expect(result.meta).toBeNull();
    });

    it("uses GET request with file_name query param", async () => {
      const getCapture = mockFetchJsonCapture(downloadStatusMock);
      await _bulkDownloadStatus("bulk-test.zip");
      const captured = getCapture();
      expect(captured!.init).toBeUndefined();
      expect(captured!.url).toContain("/api/v2/bulk_download/status/");
      expect(captured!.url).toContain("file_name=bulk-test.zip");
    });
  });

  describe("schema parsing", () => {
    it("DownloadCountResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/downloads/count.json`).json();
      const result = DownloadCountResponseSchema.parse(data);
      expect(result.calculated_transaction_count).toBe(3459);
      expect(result.maximum_transaction_limit).toBe(500000);
      expect(result.transaction_rows_gt_limit).toBe(false);
      expect(result.messages).toBeInstanceOf(Array);
    });

    it("DownloadGenerationResponseSchema parses mock", () => {
      const result = DownloadGenerationResponseSchema.parse(downloadGenerationMock);
      expect(result.status_url).toBe("/api/v2/download/status/?file_name=test.zip");
      expect(result.file_name).toBe("test.zip");
      expect(result.download_request_id).toBe("abc-123");
    });

    it("DownloadStatusResponseSchema parses mock", () => {
      const result = DownloadStatusResponseSchema.parse(downloadStatusMock);
      expect(result.status).toBe("finished");
      expect(result.total_rows).toBe(100);
      expect(result.seconds_elapsed).toBe("5.2");
    });

    it("BulkDownloadListAgenciesResponseSchema parses accounts fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/bulk-downloads/list-agencies-accounts.json`).json();
      const result = BulkDownloadListAgenciesResponseSchema.parse(data);
      expect(result.agencies.cfo_agencies).toBeInstanceOf(Array);
      expect(result.agencies.cfo_agencies.length).toBeGreaterThan(0);
      expect(result.agencies.cfo_agencies[0].name).toBe("Department of Agriculture");
      expect(result.agencies.other_agencies).toBeInstanceOf(Array);
    });

    it("BulkDownloadListAgenciesResponseSchema parses awards fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/bulk-downloads/list-agencies-awards.json`).json();
      const result = BulkDownloadListAgenciesResponseSchema.parse(data);
      expect(result.agencies.cfo_agencies).toBeInstanceOf(Array);
      expect(result.agencies.other_agencies).toBeInstanceOf(Array);
      expect(result.sub_agencies).toBeInstanceOf(Array);
    });

    it("BulkDownloadListMonthlyFilesResponseSchema parses fixture", async () => {
      const data = await Bun.file(`${import.meta.dir}/../../fixtures/bulk-downloads/list-monthly-files.json`).json();
      const result = BulkDownloadListMonthlyFilesResponseSchema.parse(data);
      expect(result.monthly_files).toBeInstanceOf(Array);
    });
  });

  describe("downloadsEndpoints describe metadata", () => {
    it("has 13 endpoints", () => {
      expect(downloadsEndpoints.length).toBe(13);
    });

    it("download_count has filter params", () => {
      const ep = downloadsEndpoints.find(e => e.name === "download_count");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBeGreaterThan(0);
    });

    it("download_idv requires award_id", () => {
      const ep = downloadsEndpoints.find(e => e.name === "download_idv");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("award_id");
    });

    it("download_status requires file_name", () => {
      const ep = downloadsEndpoints.find(e => e.name === "download_status");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("file_name");
    });

    it("download_disaster requires def_codes", () => {
      const ep = downloadsEndpoints.find(e => e.name === "download_disaster");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("def_codes");
    });

    it("bulk_download_list_agencies_accounts has no params", () => {
      const ep = downloadsEndpoints.find(e => e.name === "bulk_download_list_agencies_accounts");
      expect(ep).toBeDefined();
      expect(ep!.params.length).toBe(0);
    });

    it("bulk_download_list_monthly_files requires agency, fiscal_year, type", () => {
      const ep = downloadsEndpoints.find(e => e.name === "bulk_download_list_monthly_files");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(3);
      const requiredNames = required.map(p => p.name).sort();
      expect(requiredNames).toEqual(["agency", "fiscal_year", "type"]);
    });

    it("bulk_download_status requires file_name", () => {
      const ep = downloadsEndpoints.find(e => e.name === "bulk_download_status");
      expect(ep).toBeDefined();
      const required = ep!.params.filter(p => p.required);
      expect(required.length).toBe(1);
      expect(required[0].name).toBe("file_name");
    });

    it("all endpoints have name, path, params, and responseFields", () => {
      for (const ep of downloadsEndpoints) {
        expect(ep.name.length).toBeGreaterThan(0);
        expect(ep.path.length).toBeGreaterThan(0);
        expect(ep.params).toBeInstanceOf(Array);
        expect(ep.responseFields.length).toBeGreaterThan(0);
      }
    });

    it("all endpoints have descriptions", () => {
      for (const ep of downloadsEndpoints) {
        expect(ep.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe("DownloadsKindMap type", () => {
    it("kind map resolves correctly", () => {
      const map: DownloadsKindMap = {
        download_count: {} as any,
        download_awards: {} as any,
        download_transactions: {} as any,
        download_idv: {} as any,
        download_contract: {} as any,
        download_assistance: {} as any,
        download_status: {} as any,
        download_disaster: {} as any,
        bulk_download_list_agencies_accounts: {} as any,
        bulk_download_list_agencies_awards: {} as any,
        bulk_download_list_monthly_files: {} as any,
        bulk_download_awards: {} as any,
        bulk_download_status: {} as any,
      };
      expect(Object.keys(map).length).toBe(13);
    });
  });
});
