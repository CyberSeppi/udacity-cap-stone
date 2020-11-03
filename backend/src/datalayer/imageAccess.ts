import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createLogger } from "../utils/logger";
import { Image } from "../model/Image";
// import { getUserAlbumId } from "../utils/getUserAlbumId";

const bucketName = process.env.IMAGES_S3_BUCKET;

const AWSXRay = require("aws-xray-sdk");

const XAWS = AWSXRay.captureAWS(AWS);

const s3 = new AWS.S3({
  signatureVersion: "v4",
});

const logger = createLogger("datalayer");

export class ImageAccess {
  private docClient: DocumentClient;
  private tableimage: string;
  private imageIdxAlbUsr: string;
  private imageIdxImgId: string;
  private imageIdxAlbId: string;
  /*
    TABLE_IMAGES_GLOB_INDEX_ALBIMG: Images-Glob-Idx-AlbImg-${self:provider.stage}
    TABLE_IMAGES_GLOB_INDEX_IMAGEID: Images-Glob-Idx-Img-${self:provider.stage}
    TABLE_IMAGES_GLOB_INDEX_ALBUMID: Images-Glob-Idx-Alb-${self:provider.stage}
*/

  constructor() {
    this.docClient = createDynamoDBClient();
    this.tableimage = process.env.TABLE_IMAGES;
    this.imageIdxAlbId = process.env.TABLE_IMAGES_GLOB_INDEX_ALBUMID;
    this.imageIdxImgId = process.env.TABLE_IMAGES_GLOB_INDEX_IMAGEID;
    this.imageIdxAlbUsr = process.env.TABLE_IMAGES_GLOB_INDEX_ALBUSR;
    console.log(this.imageIdxAlbId);
    console.log(this.imageIdxAlbUsr);
    console.log(this.imageIdxImgId);

    //private readonly tableImageSecIdx = process.env.TABLE_IMAGES_SEC_INDEX
  }

  /**
   * Create a new Image.
   * @param Image will be created.
   */
  async createImage(image: Image): Promise<Image> {
    logger.debug("createImage", image);
    await this.docClient
      .put({
        TableName: this.tableimage,
        Item: image,
      })
      .promise();

    return image;
  }

  async getImage(albumId:string, imageId: string): Promise<Image> {
    logger.debug(`Get image ${imageId}`);

    try {
      const result = await this.docClient
        .query({
          TableName: this.tableimage,
        //   IndexName: this.imageIdxImgId,
          KeyConditionExpression: "ImageId = :imageId and albumId = :albumId",
          ExpressionAttributeValues: {
            ":imageId": imageId,
            ":albumId": albumId
          },
        })
        .promise();

      const items = result.Items;
      if (items[0]) {
        return items[0] as Image;
      }
    } catch (e) {
      logger.error("Could not get all images.", e);
      throw new Error(e.message);
    }
    return null;
  }

  /**
   * Get all images for a album (and user)
   * @param userId id of user
   * @param albumId id of album
   */
  async getAllImages(userId: string, albumId: string): Promise<Image[]> {
    logger.debug(`Get all images for user ${userId} and album ${albumId}`);
    // const key = getUserAlbumId(userId, albumId);
    try {
      const result = await this.docClient
        .query({
          TableName: this.tableimage,
          IndexName: this.imageIdxAlbUsr,
          // IndexName: this.tableImageSecIdx,
          KeyConditionExpression: "userId = :userId and albumId = :albumId",
          ExpressionAttributeValues: {
            ":userId": userId,
            ":albumId": albumId,
          },
        })
        .promise();

      const items = result.Items;
      return items as Image[];
    } catch (e) {
      logger.error("Could not get all images.", e);
      throw new Error(e.message);
    }
  }

  /**
   * Delete a certain imange
   * @param userId the ID of the user
   * @param albumId the ID of the album
   * @param imageId the ID of the image
   */
  async deleteimage(albumId: string, imageId: string) {
    try {
      const deleteRes = await this.docClient
        .delete({
          TableName: this.tableimage,
          Key: {
            imageId: imageId,
            albumId: albumId,
          },
          ReturnValues: "ALL_OLD",
        })
        .promise();

      console.log("DELETE TEST", deleteRes);
      await removeFromS3Bucket(imageId);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.debug("Creating a local DynamoDB instance");
    return new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}

async function removeFromS3Bucket(imageId: string) {
  logger.debug("Remove from s3", imageId);
  await new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: bucketName,
        Key: imageId,
      },
      (err, data) => {
        if (err) {
          logger.error(`Could not delete image ${imageId} from S3`);
          return reject(err);
        }
        logger.debug("Remove from s3 done", imageId);

        return resolve(data);
      }
    );
  });
}
