import 'source-map-support/register'

import * as express from 'express'
import * as awsServerlessExpress from 'aws-serverless-express'
import * as AWS from 'aws-sdk';
import {getUserId} from "../../utils/getUserId";
import {applyCorsHeader} from "../../utils/corsUtil";
import { ImageActivities } from '../../businessLayer/imageActivities';


const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const app = express()
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

//const imageAccess = new ImageAccess();
const imageActivities = new ImageActivities()

const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration: number = +process.env.SIGNED_URL_EXPIRATION;

applyCorsHeader(app);

app.post('/album/:albumId/image', jsonParser, async (_req, res) => {
    const albumId = _req.params.albumId;    


    const newImage = await imageActivities.createImage(getUserId(_req),albumId)
//    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${newImage.imageId}`

    const uploadUrl = getUploadUrl(newImage.imageId);


    res.json({
        imageId: newImage.imageId,
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
