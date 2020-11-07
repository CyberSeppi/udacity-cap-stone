import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, warmup } from "middy/middlewares";
import { ImageActivities } from "../../businessLayer/imageActivities";
import { getUserId } from "./utils/utils";
import { Logger } from "../../utils/myLogger";

const imageActivities = new ImageActivities();
const isWarmingUp = (event) => event.source === "serverless-plugin-warmup";
const onWarmup = (event) => console.log("I am just warming up", event);


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    Logger.getInstance().info("Processing event", event);

    
    const userId: string = getUserId(event);
    const albumId = event.pathParameters.albumId;

    try {
      const newImage = await imageActivities.createImage(userId, albumId);
      const uploadUrl = imageActivities.getUploadUrl(newImage.imageId);
      Logger.getInstance().debug('lamda - uploadUrl', uploadUrl);
      

      return {
        statusCode: 200,
        body: JSON.stringify({
          imageId: newImage.imageId,
          uploadUrl: uploadUrl,
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

