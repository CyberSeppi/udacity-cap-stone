import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { authenticate } from './lib'


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {


  try {
    const authResult = await authenticate(event)

    return authResult
  }
  catch (e) {
    return {
      principalId: 'apigateway.amazonaws.com',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

