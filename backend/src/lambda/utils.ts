import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as utils from "../auth/utils";
import * as loggerUtils from "../utils/logger";

export class HandlerResponse implements APIGatewayProxyResult {
  statusCode: number;
  _headers?: { [header: string]: string | number | boolean; };
  _multiValueHeaders?: { [header: string]: (string | number | boolean)[]; };
  body: string;
  _isBase64Encoded?: boolean;

  setStatus(code: number): HandlerResponse {
    this.statusCode = code;
    return this;
  }

  setBody(body: any): HandlerResponse {
    this.body = body;
    return this;
  }
}
/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  let userName: string = "dummy-User";

  loggerUtils.logDebug("GetUserId", `begin`)
  if (event.headers && event.headers.Authorization) {
    loggerUtils.logDebug("GetUserId", `ready to extract username. headers are there`)
    userName = utils.parseUserId(
      utils.extractToken(event.headers.Authorization)      
    );
    loggerUtils.logDebug("GetUserId", `username is ${userName}`)

  }

  return userName;
}
