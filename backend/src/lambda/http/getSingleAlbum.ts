import "source-map-support/register";

import * as express from "express";
import * as awsServerlessExpress from "aws-serverless-express";
import { createLogger } from "../../utils/logger";
import { getUserId } from "../../utils/getUserId";
import { applyCorsHeader } from "../../utils/corsUtil";
import { AlbumActivities } from "../../businessLayer/albumActivities";

const app = express();

const logger = createLogger("getSingleAlbum");
const albumActivities = new AlbumActivities();

applyCorsHeader(app);

app.get("/album/:albumId", async (_req, res) => {
  const albumId = _req.params.albumId;
  logger.info(`AlbumdId ${albumId}`);
  try {
    const album = await albumActivities.getAlbum(getUserId(_req), albumId);

    res.json({
      items: album.images.map(a => {
          delete a.userId
          return a
      })
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
