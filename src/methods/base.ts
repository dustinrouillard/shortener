import { Upstream } from "../config";
import { CraftedResponse, ParsedRequest } from "../types/Routes";

export async function Base(request: ParsedRequest, response: CraftedResponse) {
  return response.proxy(Upstream);
}
