import "source-map-support/register";

import * as express from "express";
import * as awsServerlessExpress from "aws-serverless-express";
import { createLogger } from "../../utils/logger";
import { CreateAlbumRequest } from "../../requests/CreateAlbumRequest";
import { getUserId } from "../../utils/getUserId";
import { applyCorsHeader } from "../../utils/corsUtil";
import { AlbumActivities } from "../../businessLayer/albumActivities";

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const app = express();

const logger = createLogger("createAlbum");

const albumActivities = new AlbumActivities();

applyCorsHeader(app);

app.put("/album", jsonParser, async (_req, res) => {
  const albumRequest: CreateAlbumRequest = _req.body;

  logger.info("createAlbum", albumRequest);

  const userId: string = getUserId(_req);

  try {
    const newAlbum = await albumActivities.createAlbum(
      userId,
      albumRequest.name,
      albumRequest.description
    );
    delete newAlbum.userId;

    res.status(200).json({
      item: newAlbum,
    });
  } catch (e) {
    return res.status(500).json({
      error: "e.message",
    });
  }
});

const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
