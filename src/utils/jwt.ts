import { verify } from 'jsonwebtoken';
import { Secret } from '../config';

export function validate(token: string): boolean {
  try {
    const valid = verify(token, Secret, { issuer: 'dstn.to' });

    if (!valid) return false;
    return true;
  } catch (error) {
    return false;
  }
}