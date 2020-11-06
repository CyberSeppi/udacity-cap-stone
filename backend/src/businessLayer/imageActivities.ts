import { ImageAccess } from "../datalayer/imageAccess";
import { Image } from "../model/Image";
import * as uuid from "uuid";
import * as loggerUtils from "../utils/logger";
import * as AWS from "aws-sdk";
import Jimp from "jimp/es";
import path from 'path'

export class ImageActivities {
  private imageAccess: ImageAccess;
  private bucketName: string;
  private imagesPath: string
  private s3: AWS.S3;

  constructor() {
    this.imageAccess = new ImageAccess();
    this.bucketName = process.env.IMAGES_S3_BUCKET;
    this.imagesPath = process.env.IMAGES_S3_PATH
    this.s3 = new AWS.S3({
      signatureVersion: "v4",
    });
  }

  async createImage(userId: string, albumId: string): Promise<Image> {
    const imageId = uuid.v4();
    loggerUtils.logDebug('createImage', `ImageId is ${imageId}`)
    loggerUtils.logDebug('createImage', `Joined path is ${path.join(this.imagesPath,imageId)}`)
    
    const imagePath = encodeURIComponent(path.join(this.imagesPath,imageId))

    loggerUtils.logDebug('createImage', `decoded ImagePath is ${imagePath}`)

    const imageUrl =`https://${this.bucketName}.s3.amazonaws.com/${imagePath}`

    loggerUtils.logDebug('createImage', `decoded ImageUrl is ${imageUrl}`)
    
    try {
      const image: Image = {
        imageId: imageId,
        createdAt: new Date().toISOString(),
        url: imageUrl,
        userId: userId,
        albumId: albumId,
        description: "",
      };
      return this.imageAccess.createImage(image);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getImage(albumId: string, imageId: string): Promise<Image> {
    return this.imageAccess.getImage(albumId, imageId);
  }

  async getAllImages(userId: string, albumId: string): Promise<Image[]> {
    return this.imageAccess.getAllImages(userId, albumId);
  }

  async deleteImage(
    userid: string,
    albumId: string,
    imageId: string
  ): Promise<void> {
    console.log(userid);
    return this.imageAccess.deleteimage(albumId, imageId);
  }

  async createThumbNailImage(imageId: string, bucketName: string) {
    loggerUtils.logInfo(
      "createThumbnailImage",
      `processing ${imageId} in bucket ${bucketName}`
    );

    var params = { Bucket: bucketName, Key: imageId };

    try {
      loggerUtils.logInfo(
        "createThumbnailImage",
        `processing ${JSON.stringify(params)}`
      );

      const s3Output = await this.s3.getSignedUrl('getObject',{
        Bucket: bucketName,
        Key: imageId,
        Expires: 300,
      })

      loggerUtils.logInfo("Thumnail business", `signedUrl: ${s3Output}`)
      const image = await Jimp.read(s3Output);
      loggerUtils.logInfo("Thumnail business", `image loaded: ${image.getHeight()}`)      
      image.resize(150, Jimp.AUTO);
      loggerUtils.logInfo("Thumnail business", `image loaded: ${image.getHeight()}`)      
      const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

      await this.imageAccess.saveThumbnailToS3(path.parse(imageId).base, convertedBuffer)

    } catch (e) {
      throw new Error(e.message);
    }
  }

}
