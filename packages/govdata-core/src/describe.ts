export interface ParamDescription {
  name: string;
  type: string;
  required: boolean;
  values?: string[];
  min?: number;
  description?: string;
}

export interface EndpointDescription {
  name: string;
  path: string;
  description: string;
  params: ParamDescription[];
  responseFields: string[] | Record<string, string[]>;
}
