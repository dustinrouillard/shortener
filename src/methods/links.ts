import { Upstream } from "../config";
import { CraftedResponse, ParsedRequest } from "../types/Routes";
import { getIp } from "../utils/ip";
import { createShortLink, deleteShortLink, getShortLink, trackVisit } from "../utils/kv";
import { random } from "../utils/strings";

export async function Create(request: ParsedRequest<{ Body: { target: string; code?: string; ttl?: number } }>, response: CraftedResponse) {
  if (!request.body.target) return response.status(400).send({ error: 'missing_link_target' });

  const code = request.body.code || random(8, { chars: false, lower: false });
  const link = await createShortLink(code, request.body.target, request.body.ttl);

  return response.status(200).send(link);
}

export async function Get(request: ParsedRequest<{ Params: { code: string } }>, response: CraftedResponse) {
  const json = request.headers.accept?.startsWith('application/json');
  const link = await getShortLink(request.params.code);
  if (!link) return response.proxy(Upstream);
  if (!json) await trackVisit(request.params.code, getIp(request), request.headers["user-agent"]);
  return json ? response.status(200).send(link) : response.redirect(link.target);
}

export async function Delete(request: ParsedRequest<{ Params: { code: string } }>, response: CraftedResponse) {
  const link = await deleteShortLink(request.params.code);
  if (!link) return response.status(404).send({ error: 'link_not_found' });
  return response.status(204).send();
}