import "source-map-support/register";

import * as express from "express";
import * as awsServerlessExpress from "aws-serverless-express";
import { getUserId } from "../../utils/getUserId";
import { applyCorsHeader } from "../../utils/corsUtil";
import { AlbumActivities } from "../../businessLayer/albumActivities";

const app = express();

const albumActivities = new AlbumActivities();

applyCorsHeader(app);

app.delete("/album/:albumId", async (_req, res) => {
  const albumId = _req.params.albumId;

  const userid = getUserId(_req);

  try {
    await albumActivities.deleteAlbum(userid, albumId);
    res.status(200).json({
      message: `deleted album ${albumId}`,
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
