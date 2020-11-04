import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as utils from '../utils'
import * as logUtils from '../../utils/logger'
import { warmup } from 'middy/middlewares'


const isWarmingUp = (event) => event.source === 'serverless-plugin-warmup'
const onWarmup = (event) => console.log('I am just warming up', event)


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logUtils.logInfo("createTodo lambda", 'Processing event ', event)


  const userName = utils.getUserId(event)
  logUtils.logInfo("createTodo lambda", "userid: ", userName)



  return {
    statusCode: 201,
    body: JSON.stringify({
      item: {
          "hello": "world"
      }
    })
  }
}).use(
  cors({
    credentials: true
  })
).use(
  warmup({
    isWarmingUp,
    onWarmup
  })
)