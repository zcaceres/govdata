import type { Agency, EndpointFor } from "./datasets.js";
import type { MetadataResponse, DatasetsResponse } from "./schemas.js";

export interface ColumnInfo {
  name: string;
  type: string;
  description?: string;
}

export interface DatasetDescription {
  agency: string;
  endpoint: string;
  name?: string;
  description?: string;
  frequency?: string;
  tags?: string[];
  columns: ColumnInfo[];
  filterOperators: string[];
  textSummary: string;
}

const FILTER_OPERATORS = ["eq", "neq", "gt", "lt", "like", "in", "not_in"];

interface DescribeDeps {
  getMetadata: <A extends Agency>(agency: A, endpoint: EndpointFor<A>) => Promise<MetadataResponse>;
  listDatasets: () => Promise<DatasetsResponse>;
}

export function createDescribe(deps: DescribeDeps) {
  const cache = new Map<string, DatasetDescription>();

  return async function describe<A extends Agency>(
    agency: A,
    endpoint: EndpointFor<A>,
  ): Promise<DatasetDescription> {
    const key = `${agency}/${String(endpoint)}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const [metaResult, datasetsResult] = await Promise.all([
      deps.getMetadata(agency, endpoint),
      deps.listDatasets(),
    ]);

    const columns: ColumnInfo[] = metaResult.map((row) => ({
      name: String(row.short_name ?? row.column_name ?? ""),
      type: String(row.application_datatype ?? row.data_type ?? "unknown"),
      description: row.variable_description ? String(row.variable_description) : undefined,
    }));

    const endpointStr = String(endpoint);
    const datasetInfo = datasetsResult.datasets.find(
      (d) => d.agency.abbr === agency && d.api_url === endpointStr,
    );

    const desc: DatasetDescription = {
      agency,
      endpoint: endpointStr,
      name: datasetInfo?.name,
      description: datasetInfo?.description,
      frequency: datasetInfo?.frequency,
      tags: datasetInfo?.tag_list,
      columns,
      filterOperators: FILTER_OPERATORS,
      textSummary: formatTextSummary(agency, endpointStr, columns, datasetInfo),
    };

    cache.set(key, desc);
    return desc;
  };
}

function formatTextSummary(
  agency: string,
  endpoint: string,
  columns: ColumnInfo[],
  datasetInfo?: { name?: string; description?: string; frequency?: string },
): string {
  const lines: string[] = [];
  lines.push(`${agency}/${endpoint}`);
  if (datasetInfo?.name) lines.push(`Name: ${datasetInfo.name}`);
  if (datasetInfo?.description) lines.push(`Description: ${datasetInfo.description}`);
  if (datasetInfo?.frequency) lines.push(`Update frequency: ${datasetInfo.frequency}`);
  lines.push(`Columns (${columns.length}):`);
  for (const col of columns) {
    const desc = col.description ? ` — ${col.description}` : "";
    lines.push(`  - ${col.name} (${col.type})${desc}`);
  }
  lines.push(`Filter operators: ${FILTER_OPERATORS.join(", ")}`);
  return lines.join("\n");
}
