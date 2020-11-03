import 'source-map-support/register'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'
import { createLogger } from "../../utils/logger";
//import { ImageAccess } from "../../datalayer/imageAccess";
import { getUserId } from "../../utils/getUserId";
import { applyCorsHeader } from "../../utils/corsUtil";
import { ImageActivities } from '../../businessLayer/imageActivities'

const app = express()

const logger = createLogger("deleteAlbum");
const imageActivities = new ImageActivities()

applyCorsHeader(app);

app.delete('/album/:albumId/image/:imageId', async (_req, res) => {
    const albumId = _req.params.albumId;
    const imageId = _req.params.imageId;
    logger.info(`AlbumdId ${albumId}, imageId ${imageId}`);

    try {
        await imageActivities.deleteImage(getUserId(_req),albumId, imageId);
        res.status(200).send('');
    } catch (ex) {
        res.status(500).send(ex.message);
    }
})


const server = awsServerlessExpress.createServer(app)
exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context)
}
