// With friendly support from https://github.com/auth0-samples/jwt-rsa-aws-custom-authorizer
// THE WHOLE LIB WAS COPIED FROM THERE.

import { extractToken } from '../../auth/utils'
import * as logUtils from '../../utils/logger'


const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const util = require('util');

const getPolicyDocument = (effect, resource) => {
    const policyDocument = {
        Version: '2012-10-17', // default version
        Statement: [{
            Action: 'execute-api:Invoke', // default action
            Effect: effect,
            Resource: resource,
        }]
    };
    return policyDocument;
}


// extract and return the Bearer Token from the Lambda event parameters
const getToken = (params) => {
    if (!params.type || params.type !== 'TOKEN') {
        throw new Error('Expected "event.type" parameter to have value "TOKEN"');
    }

    const tokenString = params.authorizationToken;
    return extractToken(tokenString);
}

const jwtOptions = {
    issuer: process.env.TOKEN_ISSUER
};

export async function authenticate(params) {
    logUtils.logDebug('AuthLib', 'AuthenticationLib (authenticate) Params', params);
    const token = getToken(params);
    logUtils.logDebug('AuthLib', 'Token', token)
    const decoded = jwt.decode(token, { complete: true });
    logUtils.logDebug('AuthLib', 'Token decoded', decoded)
    
    if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new Error('invalid token');
    }
    logUtils.logDebug('AuthLib', 'Token seems to be alright')
    

    const getSigningKey = util.promisify(client.getSigningKey);
    return getSigningKey(decoded.header.kid)
        .then((key) => {
            const signingKey = key.publicKey || key.rsaPublicKey;
            return jwt.verify(token, signingKey, jwtOptions);
        })
        .then((decoded)=> ({
            principalId: 'apigateway.amazonaws.com',
            policyDocument: getPolicyDocument('Allow', '*'),
            context: { scope: decoded.scope }
        }));
}

 const client = jwksClient({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10, // Default value
        jwksUri: process.env.JWKS_URI
  });
