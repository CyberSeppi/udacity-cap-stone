import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateAlbumRequest } from "../../requests/CreateAlbumRequest";
import { AlbumActivities } from "../../businessLayer/albumActivities";
import * as loggerUtils from "../../utils/logger";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { warmup } from "middy/middlewares";
import { getUserId } from "../utils";

const albumActivities = new AlbumActivities();
const isWarmingUp = (event) => event.source === "serverless-plugin-warmup";
const onWarmup = (event) => console.log("I am just warming up", event);

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Processing event", event);

    const albumRequest: CreateAlbumRequest = JSON.parse(event.body);

    loggerUtils.logInfo("createAlbum", JSON.stringify(albumRequest));

    const userId: string = getUserId(event);
    loggerUtils.logInfo("createAlbum", "after getUserId", userId);

    try {
      const newAlbum = await albumActivities.createAlbum(
        userId,
        albumRequest.name,
        albumRequest.description
      );
      delete newAlbum.userId;

      loggerUtils.logDebug("Create Album", "returning now");
      return {
        statusCode: 200,
        body: JSON.stringify({
          item: newAlbum,
        }),
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: e.message,
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