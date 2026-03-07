import type { EndpointDescription } from "./describe";
import type { GovResult } from "./response";

export interface GovDataPlugin {
  prefix: string;
  describe(): { endpoints: EndpointDescription[] };
  endpoints: Record<string, (params?: any) => Promise<GovResult>>;
}
