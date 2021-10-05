import { routes } from './routes';

import { CraftedResponse, Method, ParsedRequest } from './types/Routes';
import { Base } from './methods/base';

addEventListener('fetch', (event) => {
  event.respondWith(new Promise(async (resolve) => {
    const url = new URL(event.request.url);

    const request = event.request.clone();
    const headers = Object.fromEntries([...request.headers]);
    const method = request.method as Method;

    let body;
    if (!['GET', 'OPTIONS', 'HEAD'].includes(method)) {
      if (request.headers.get('content-type')?.startsWith('application/json')) body = await request.json();
      else body = await request.text();
    }

    const route = routes.find((route) => route.route.match(url.pathname.endsWith('/') && url.pathname.length > 1 ? url.pathname.slice(0, -1) : url.pathname) && route.method == event.request.method);
    const params = route?.route.match(url.pathname.endsWith('/') && url.pathname.length > 1 ? url.pathname.slice(0, -1) : url.pathname);
    const query = Object.fromEntries([...url.searchParams]);

    const req: ParsedRequest = {
      body,
      headers,
      method,
      params,
      query,
      url,
      cloudflare: request.cf,
      _event: event
    };

    const res: CraftedResponse = {
      statusCode: 200,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': '*'
      },
      redirect: (target: string, code = 302) => {
        const response = Response.redirect(target, code);
        resolve(response);
      },
      send: (body?: any) => {
        if (typeof body == 'object' && !res.headers['content-type']) res.headers['content-type'] = 'application/json';
        const response = new Response(typeof body == 'object' ? JSON.stringify(body) : body, { headers: res.headers, status: res.statusCode });
        resolve(response);
      },
      proxy: async (host: string) => {
        const response = await fetch(`${host}${url.pathname}`, request);
        resolve(response);
      },
      header: (key: string, value: string | number | any) => {
        res.headers[key.toLowerCase()] = value.toString();
        return res;
      },
      status: (code: number) => {
        res.statusCode = code;
        return res;
      }
    }

    if (route?.middlewares) for (const middleware of route.middlewares) middleware(req, res);

    route ? route.handler(req, res) : Base(req, res);
  }));
});