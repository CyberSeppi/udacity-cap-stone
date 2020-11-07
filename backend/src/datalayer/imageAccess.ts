import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Image } from "../model/Image";
import path from "path";
import { Logger } from "../utils/myLogger";

const AWSXRay = require("aws-xray-sdk");
const XAWS = AWSXRay.captureAWS(AWS);

export class ImageAccess {
  private docClient: DocumentClient;
  private tableimage: string;
  private imageIdxAlbUsr: string;
  private s3: AWS.S3;
  private imagesBucketName: string;
  private imagesPath: string;
  private thumbnailPath: string;
  private signedUrlExpiration: number;
  private readonly thumbnailSuffix = "-thumbnail";

  /*
    TABLE_IMAGES_GLOB_INDEX_ALBIMG: Images-Glob-Idx-AlbImg-${self:provider.stage}
    TABLE_IMAGES_GLOB_INDEX_IMAGEID: Images-Glob-Idx-Img-${self:provider.stage}
    TABLE_IMAGES_GLOB_INDEX_ALBUMID: Images-Glob-Idx-Alb-${self:provider.stage}
*/

  constructor() {
    this.docClient = createDynamoDBClient();
    this.tableimage = process.env.TABLE_IMAGES;
    this.imageIdxAlbUsr = process.env.TABLE_IMAGES_GLOB_INDEX_ALBUSR;
    this.imagesBucketName = process.env.IMAGES_S3_BUCKET;
    this.imagesPath = process.env.IMAGES_S3_PATH;
    this.thumbnailPath = process.env.THUMBNAIL_S3_PATH;
    this.signedUrlExpiration = Number(process.env.SIGNED_URL_EXPIRATION);
    this.s3 = new AWS.S3({
      signatureVersion: "v4",
    });

    //private readonly tableImageSecIdx = process.env.TABLE_IMAGES_SEC_INDEX
  }
  /**
   * Create a new Image.
   * @param Image will be created.
   */
  async createImage(image: Image): Promise<Image> {
    const params = {
      TableName: this.tableimage,
      Item: image,
    };
    Logger.getInstance().debug("Put with params", params);

    await this.docClient.put(params).promise();

    return image;
  }

  async getImage(albumId: string, imageId: string): Promise<Image> {
    try {
      const params = {
        TableName: this.tableimage,
        //   IndexName: this.imageIdxImgId,
        KeyConditionExpression: "ImageId = :imageId and albumId = :albumId",
        ExpressionAttributeValues: {
          ":imageId": imageId,
          ":albumId": albumId,
        },
      };

      Logger.getInstance().debug("getImage params", params);

      const result = await this.docClient.query(params).promise();

      const items = result.Items;
      if (items[0]) {
        return items[0] as Image;
      }
    } catch (e) {
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
    // const key = getUserAlbumId(userId, albumId);
    try {
      const params = {
        TableName: this.tableimage,
        IndexName: this.imageIdxAlbUsr,
        // IndexName: this.tableImageSecIdx,
        KeyConditionExpression: "userId = :userId and albumId = :albumId",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":albumId": albumId,
        },
      };

      Logger.getInstance().debug("getAllImages params", params);

      const result = await this.docClient.query(params).promise();

      const items = result.Items;
      return items as Image[];
    } catch (e) {
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
      const params = {
        TableName: this.tableimage,
        Key: {
          imageId: imageId,
          albumId: albumId,
        },
        ReturnValues: "ALL_OLD",
      };

      Logger.getInstance().debug("delete Image Params", params);

      await this.docClient.delete(params).promise();

      await this.removeFromS3Bucket(imageId);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  getUploadUrl(imageId: string) {
    const signedUrl = this.s3.getSignedUrl("putObject", {
      Bucket: this.imagesBucketName,
      Key: path.join(this.imagesPath, imageId).normalize,
      Expires: this.signedUrlExpiration,
    });

    Logger.getInstance().debug("signedUrl", signedUrl);

    return signedUrl;
  }

  async saveThumbnailToS3(imageId: string, imageBuffer: Buffer) {
    try {
      const destparams = {
        Bucket: this.imagesBucketName,
        Key: path.join(this.thumbnailPath, imageId.concat(this.thumbnailSuffix)),
        Body: imageBuffer,
        ContentType: "image",
      };

      Logger.getInstance().debug("saveThumnail params s3", destparams);

      await this.s3.putObject(destparams).promise();
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async removeFromS3Bucket(imageId: string) {
    await new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Bucket: this.imagesBucketName,
          Key: path.join(this.imagesPath, imageId),
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        }
      );
    });

    await new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Bucket: this.imagesBucketName,
          Key: path.join(this.thumbnailPath, imageId.concat(this.thumbnailSuffix)),
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        }
      );
    });
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    return new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
