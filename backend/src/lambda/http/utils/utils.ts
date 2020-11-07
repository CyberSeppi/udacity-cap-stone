import { APIGatewayProxyEvent} from "aws-lambda";
//APIGatewayProxyResult
import * as utils from "../../../auth/utils";


/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  let userName: string = "dummy-User";

  if (event.headers && event.headers.Authorization) {
    userName = utils.parseUserId(
      utils.extractToken(event.headers.Authorization)      
    );

  }

  return userName;
}
