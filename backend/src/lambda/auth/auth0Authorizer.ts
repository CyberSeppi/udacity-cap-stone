import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import { authenticate } from "./lib";
import { Logger } from "../../utils/myLogger";

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    Logger.getInstance().info("Processing event", event);
    const authResult = await authenticate(event);
    Logger.getInstance().debug("Auth", authResult);

    return authResult;
  } catch (e) {
    const params = {
      principalId: "apigateway.amazonaws.com",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };

    return params;
  }
};
