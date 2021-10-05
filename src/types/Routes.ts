import Route from 'route-parser';

export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

export interface RequestGeneric {
  Body?: unknown;
  Query?: unknown;
  Params?: unknown;
  Headers?: { [key: string]: string | number };
}

export interface ResponseGeneric {
  Body?: unknown;
}

export interface RouteGeneric extends RequestGeneric, ResponseGeneric { }

export interface ParsedRequest<RG extends RouteGeneric = RouteGeneric> {
  body: RG["Body"];
  query: RG["Query"];
  params: RG["Params"];
  headers: RG["Headers"] & { [key: string]: string };
  method: Method;
  url: URL;
  cloudflare: IncomingRequestCfProperties
  _event: FetchEvent;
}

export interface CraftedResponse {
  statusCode: number;
  headers: { [key: string]: string };
  header: (key: string, value: string | number) => CraftedResponse;
  status: (code: number) => CraftedResponse;
  send: (body?: any) => void;
  proxy: (host: string) => Promise<void>;
  redirect: (link: string, code?: number | 302) => void;
}

export type Middleware = (request: ParsedRequest, response: CraftedResponse) => void

export interface RouteDefinition {
  route: Route<{ [i: string]: any; }>;
  method: Method;
  handler: (request: ParsedRequest<any>, response: CraftedResponse) => void | Promise<void>;
  args?: any[];
  middlewares?: Middleware[];
}
