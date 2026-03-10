import type { ClientOptions } from "./types";
import type { GovResult } from "./response";

export interface PaginatedEndpoint<TParams, TResult> {
  (params?: TParams, options?: ClientOptions): Promise<TResult>;
  pages(params?: TParams, options?: ClientOptions): AsyncGenerator<TResult>;
  all(params?: Omit<TParams, "page">, options?: ClientOptions & { maxPages?: number }): Promise<TResult>;
}

export function withPagination<TParams extends { page?: number }, TResult extends GovResult>(
  fn: (params?: TParams, options?: ClientOptions) => Promise<TResult>,
): PaginatedEndpoint<TParams, TResult> {
  const paginated = ((params?: TParams, options?: ClientOptions) =>
    fn(params, options)) as PaginatedEndpoint<TParams, TResult>;

  paginated.pages = async function* (
    params?: TParams,
    options?: ClientOptions,
  ): AsyncGenerator<TResult> {
    let page = params?.page ?? 1;
    while (true) {
      const result = await fn({ ...params, page } as TParams, options);
      yield result;
      if (!result.meta || page >= result.meta.pages) break;
      page++;
    }
  };

  paginated.all = async (
    params?: Omit<TParams, "page">,
    options?: ClientOptions & { maxPages?: number },
  ): Promise<TResult> => {
    const maxPages = options?.maxPages ?? 100;
    let allData: unknown[] = [];
    let lastResult: TResult | undefined;
    let pageCount = 0;

    for await (const page of paginated.pages(params as TParams, options)) {
      lastResult = page;
      if (Array.isArray(page.data)) {
        allData = allData.concat(page.data);
      }
      pageCount++;
      if (pageCount >= maxPages) break;
    }

    if (!lastResult) {
      return fn(params as TParams, options);
    }

    const mutableResult = lastResult as { -readonly [K in keyof TResult]: TResult[K] };
    mutableResult.data = allData as TResult["data"];
    if (lastResult.meta) {
      mutableResult.meta = { ...lastResult.meta, total_results: allData.length, pages: pageCount } as TResult["meta"];
    }
    return lastResult;
  };

  return paginated;
}
