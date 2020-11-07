import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, warmup } from "middy/middlewares";
import { ImageActivities } from "../../businessLayer/imageActivities";
import { getUserId } from "./utils/utils";

const imageActivities = new ImageActivities();
const isWarmingUp = (event) => event.source === "serverless-plugin-warmup";
const onWarmup = (event) => console.log("I am just warming up", event);

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const albumId = event.pathParameters.albumId;
    const imageId = event.pathParameters.imageId;
    const userId: string = getUserId(event);

    try {
      await imageActivities.deleteImage(userId, albumId, imageId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `album ${albumId} deleted`,
        }),
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.message,
        }),
      };
    }
  }
)
  .use(
    cors({
      credentials: true,
    })
  )
  .use(
    warmup({
      isWarmingUp,
      onWarmup,
    })
  );
