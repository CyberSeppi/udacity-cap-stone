import 'source-map-support/register'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'
import {createLogger} from "../../utils/logger";
import {AlbumAccess} from "../../datalayer/albumAccess";
import {getUserId} from "../../utils/getUserId";
import {applyCorsHeader} from "../../utils/corsUtil";

const app = express()

const logger = createLogger("getAlbums");

const albumAccess = new AlbumAccess();

applyCorsHeader(app);

app.get('/album', async (_req, res) => {
    logger.info("getAlbums");

    const albums = await albumAccess.getAllAlbums(getUserId(_req));

    res.json({
        items: albums.map(a => {
            delete a.userId;
            return a
        })
    })
})


const server = awsServerlessExpress.createServer(app)
exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context)
}
