import { ParsedRequest } from "../types/Routes";

export function getIp(request: ParsedRequest) {
  return request.headers ? request.headers["cf-connecting-ip"] : '127.0.0.1'
}