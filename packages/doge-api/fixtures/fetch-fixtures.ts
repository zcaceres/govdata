import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://api.doge.gov";
const DIR = import.meta.dir;

const endpoints: Record<string, string> = {
  grants: "/savings/grants?per_page=5",
  contracts: "/savings/contracts?per_page=5",
  leases: "/savings/leases?per_page=5",
  payments: "/payments?per_page=5",
  statistics: "/payments/statistics",
};

async function fetchFixtures() {
  for (const [name, path] of Object.entries(endpoints)) {
    console.log(`Fetching ${name}...`);
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
      console.error(`  Failed: ${res.status} ${res.statusText}`);
      continue;
    }
    const data = await res.json();
    const file = join(DIR, `${name}.json`);
    writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log(`  Saved to ${file}`);
  }
}

fetchFixtures().catch(console.error);
