import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { authenticate } from './lib'
import * as logUtils from '../../utils/logger'


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  logUtils.logInfo('auth0Authorizer','Authorizing a user', event.authorizationToken)

  try {
    const authResult = await authenticate(event)
    logUtils.logInfo('auth0Authorizer','AuthResult', authResult)

    return authResult
  }
  catch (e) {
    logUtils.logInfo('Authorization failed with ', e)
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

