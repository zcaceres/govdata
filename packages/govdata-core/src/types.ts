export interface Meta {
  total_results: number;
  pages: number;
}

export interface ClientOptions {
  baseUrl?: string;
  maxRetries?: number;
  initialRetryMs?: number;
}
