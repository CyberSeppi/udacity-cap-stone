import 'source-map-support/register'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'
import {createLogger} from "../../utils/logger";
import * as uuid from 'uuid'
import {Image} from "../../model/Image";
import {ImageAccess} from "../../datalayer/imageAccess";
import * as AWS from 'aws-sdk';
import {getUserAlbumId} from "../../utils/getUserAlbumId";
import {getUserId} from "../../utils/getUserId";
import {applyCorsHeader} from "../../utils/corsUtil";


const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const app = express()
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})
const logger = createLogger("createImage");

const imageAccess = new ImageAccess();

const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration: number = +process.env.SIGNED_URL_EXPIRATION;

applyCorsHeader(app);

app.post('/album/:albumId/image', jsonParser, async (_req, res) => {
    const albumId = _req.params.albumId;
    logger.info(`AlbumdId ${albumId}`);

    const imageId = uuid.v4();

    const id = getUserAlbumId(getUserId(_req), albumId);

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    const image: Image = {
        userAlbumId: id,
        imageId: imageId,
        createdAt: new Date().toISOString(),
        url: imageUrl
    }

    await imageAccess.createImage(image);

    const uploadUrl = getUploadUrl(imageId);

    logger.info(`Created SignedURL for image URL  ${imageUrl}`);

    res.json({
        uploadUrl: uploadUrl
    })
})


const server = awsServerlessExpress.createServer(app)
exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context)
}


function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: urlExpiration
    })
}
