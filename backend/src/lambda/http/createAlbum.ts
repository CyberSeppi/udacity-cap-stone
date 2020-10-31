import 'source-map-support/register'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'
import {createLogger} from "../../utils/logger";
import {AlbumAccess} from "../../datalayer/albumAccess";
import {CreateAlbumRequest} from "../../requests/CreateAlbumRequest";
import {Album} from "../../model/Album";
import * as uuid from 'uuid'
import {getUserId} from "../../utils/getUserId";
import {applyCorsHeader} from "../../utils/corsUtil";


const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const app = express()

const logger = createLogger("createAlbum");

const albumAccess = new AlbumAccess();

applyCorsHeader(app);

app.put('/album', jsonParser, async (_req, res) => {
    const newAlbum: CreateAlbumRequest = _req.body;

    logger.info("createAlbum", newAlbum);
    const albumId = uuid.v4();

    const userId: string = getUserId(_req);

    const albumData: Album = {
        name: newAlbum.name,
        description: newAlbum.description,
        albumId: albumId,
        userId,
        createdAt: new Date().toISOString()
    }

    await albumAccess.createAlbum(albumData);
    delete albumData.userId
    res.json({
        item: albumData
    })
})


const server = awsServerlessExpress.createServer(app)
exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context)
}
