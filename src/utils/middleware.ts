import { CraftedResponse, ParsedRequest } from "../types/Routes";
import { validate } from "./jwt";

export function Management(request: ParsedRequest, response: CraftedResponse) {
  const token = request.headers.authorization?.replace(/[B|b]earer[ ]/, '');
  if (!token) return response.status(403).send({ error: 'requires_authentication' });

  const valid = validate(token);
  if (!valid) return response.status(403).send({ error: 'invalid_authentication' });

  return true;
}