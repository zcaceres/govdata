import { buildSuggestions } from "./suggest.js";

function redactUrl(url: string): string {
  return url.replace(/X-API-KEY=[^&]+/, "X-API-KEY=***");
}

export class DOLApiError extends Error {
  public readonly suggestions: string[];

  constructor(
    public readonly status: number,
    public readonly body: string,
    public readonly url: string,
    public readonly agency?: string,
    public readonly endpoint?: string,
  ) {
    const suggestions = buildSuggestions({ status, body, url, agency, endpoint });
    const hint = suggestions.length > 0 ? `\n  ${suggestions.join("\n  ")}` : "";
    super(`DOL API error ${status} from ${redactUrl(url)}: ${body}${hint}`);
    this.name = "DOLApiError";
    this.suggestions = suggestions;
  }
}
