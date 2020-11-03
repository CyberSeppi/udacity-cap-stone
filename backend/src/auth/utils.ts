import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}


export function extractToken(authorizationHeader: string): string {

  if (!authorizationHeader) {
    throw new Error('Expected "event.authorizationToken" parameter to be set');
  }

  const match = authorizationHeader.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new Error(`Invalid Authorization token - ${authorizationHeader} does not match "Bearer .*"`);
  }
  return match[1];
}