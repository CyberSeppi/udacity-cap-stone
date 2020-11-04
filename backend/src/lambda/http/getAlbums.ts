import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors, warmup } from "middy/middlewares";
import { AlbumActivities } from "../../businessLayer/albumActivities";
import * as loggerUtils from "../../utils/logger";
import { getUserId } from "../utils";

const albumActivities = new AlbumActivities();
const isWarmingUp = (event) => event.source === "serverless-plugin-warmup";
const onWarmup = (event) => console.log("I am just warming up", event);

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    loggerUtils.logInfo("GteAlbums", `Processing event ${event}`);
    const userId: string = getUserId(event);
    try {
      const albums = await albumActivities.getAlbums(userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: albums.map((a) => {
            delete a.userId;
            return a;
          }),
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
