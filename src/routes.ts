import Route from 'route-parser';

import { Base } from './methods/base';
import { Create, Get, Delete } from './methods/links';

import { RouteDefinition } from './types/Routes';
import { Management } from './utils/middleware';

export const routes: RouteDefinition[] = [
  { route: new Route('/'), method: 'GET', handler: Base },
  { route: new Route('/:code'), method: 'GET', handler: Get },

  // Management routes
  { route: new Route('/create'), method: 'POST', handler: Create, middlewares: [Management] },
  { route: new Route('/:code'), method: 'DELETE', handler: Delete, middlewares: [Management] },
  { route: new Route('/:code/stats'), method: 'GET', handler: Base, middlewares: [Management] },
];
