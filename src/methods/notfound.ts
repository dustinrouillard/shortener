import { CraftedResponse, ParsedRequest } from "../types/Routes";

export function NotFound(request: ParsedRequest, response: CraftedResponse) {
  return response.status(404).send({ error: true, code: 'not_found' });
}
