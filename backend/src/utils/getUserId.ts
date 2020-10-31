import {parseUserId} from "../auth/utils";

export function getUserId(_req) : string{
    const authorization = _req.headers.authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    return parseUserId(jwtToken)
}
