import { AGENCIES, type Agency } from "./datasets.js";

export function levenshtein(a: string, b: string): number {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  const m = al.length;
  const n = bl.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = al[i - 1] === bl[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function findClosestAgency(input: string): string | null {
  const agencies = Object.keys(AGENCIES);
  return findClosest(input, agencies, 3);
}

export function findClosestEndpoint(agency: Agency, input: string): string | null {
  const endpoints = AGENCIES[agency] as readonly string[];
  const maxDist = Math.min(5, Math.max(2, Math.floor(input.length * 0.5)));
  return findClosest(input, [...endpoints], maxDist);
}

function findClosest(input: string, candidates: string[], maxDist: number): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = levenshtein(input, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return bestDist <= maxDist ? best : null;
}

export function buildSuggestions(opts: {
  status: number;
  body: string;
  url: string;
  agency?: string;
  endpoint?: string;
}): string[] {
  const suggestions: string[] = [];

  if (opts.status === 429) {
    suggestions.push("Rate limited. Wait a few minutes before retrying.");
  }

  if (opts.status === 401) {
    suggestions.push("Check that your API key is valid and correctly set.");
  }

  if (opts.status === 404) {
    if (opts.agency) {
      const agencies = Object.keys(AGENCIES);
      if (!(opts.agency in AGENCIES)) {
        const closest = findClosestAgency(opts.agency);
        if (closest) suggestions.push(`Did you mean agency '${closest}'?`);
        suggestions.push(`Valid agencies: ${agencies.join(", ")}`);
      } else if (opts.endpoint) {
        const agency = opts.agency as Agency;
        const endpoints = AGENCIES[agency] as readonly string[];
        if (!endpoints.includes(opts.endpoint as any)) {
          const closest = findClosestEndpoint(agency, opts.endpoint);
          if (closest) suggestions.push(`Did you mean endpoint '${closest}'?`);
          suggestions.push(`Valid endpoints for ${agency}: ${[...endpoints].join(", ")}`);
        }
      }
    }
  }

  if (opts.status === 400) {
    try {
      const parsed = JSON.parse(opts.body);
      if (parsed.error) suggestions.push(String(parsed.error));
      if (parsed.message) suggestions.push(String(parsed.message));
    } catch {}
  }

  return suggestions;
}
