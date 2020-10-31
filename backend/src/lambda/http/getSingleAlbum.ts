import 'source-map-support/register'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'
import {createLogger} from "../../utils/logger";
import {ImageAccess} from "../../datalayer/imageAccess";
import {getUserId} from "../../utils/getUserId";
import {applyCorsHeader} from "../../utils/corsUtil";
import {Image} from "../../model/Image";

const app = express()

const logger = createLogger("getSingleAlbum");
const imageAccess = new ImageAccess();

applyCorsHeader(app);

app.get('/album/:albumId', async (_req, res) => {
    const albumId = _req.params.albumId;

    logger.info(`AlbumdId ${albumId}`);

    const images: Image[] = await imageAccess.getAllImages(getUserId(_req), albumId);

    res.json({
        items: images
    })
})


const server = awsServerlessExpress.createServer(app)
exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context)
}
