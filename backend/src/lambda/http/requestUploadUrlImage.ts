import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, warmup } from "middy/middlewares";
import { ImageActivities } from "../../businessLayer/imageActivities";
import * as loggerUtils from "../../utils/logger";
import { getUserId } from "../utils";
import * as AWS from 'aws-sdk';

const imageActivities = new ImageActivities();
const isWarmingUp = (event) => event.source === "serverless-plugin-warmup";
const onWarmup = (event) => console.log("I am just warming up", event);

const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration: number = +process.env.SIGNED_URL_EXPIRATION;
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    loggerUtils.logInfo('requestUploadUrlImage', 'Processing event', event)
    
    const userId: string = getUserId(event);
    const albumId = event.pathParameters.albumId;

    try {
      const newImage = await imageActivities.createImage(userId, albumId);
      const uploadUrl = getUploadUrl(newImage.imageId);

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

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration,
  });
}
