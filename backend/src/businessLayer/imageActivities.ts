import { ImageAccess } from "../datalayer/imageAccess";
import { Image } from "../model/Image";
import * as uuid from "uuid";
import * as AWS from "aws-sdk";
import Jimp from "jimp/es";
import path from "path";
import { Logger } from "../utils/myLogger";

export class ImageActivities {
  private imageAccess: ImageAccess;
  private bucketName: string;
  private imagesPath: string;
  private s3: AWS.S3;

  constructor() {
    this.imageAccess = new ImageAccess();
    this.bucketName = process.env.IMAGES_S3_BUCKET;
    this.imagesPath = process.env.IMAGES_S3_PATH;
    this.s3 = new AWS.S3({
      signatureVersion: "v4",
    });
  }

  async createImage(userId: string, albumId: string): Promise<Image> {
    Logger.getInstance().info("createImage", userId, albumId);

    const imageId = uuid.v4();

    const imagePath = encodeURIComponent(path.join(this.imagesPath, imageId));
    Logger.getInstance().debug("encoded imagepath", imagePath);

    const imageUrl = `https://${this.bucketName}.s3.amazonaws.com/${imagePath}`;

    try {
      const image: Image = {
        imageId: imageId,
        createdAt: new Date().toISOString(),
        url: imageUrl,
        userId: userId,
        albumId: albumId,
        description: "",
      };
      Logger.getInstance().debug("image to be saved", image);

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
    // var params = { Bucket: bucketName, Key: imageId };

    try {
      const s3Output = await this.s3.getSignedUrl("getObject", {
        Bucket: bucketName,
        Key: imageId,
        Expires: 300,
      });

      const image = await Jimp.read(s3Output);
      image.resize(150, Jimp.AUTO);
      const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

      Logger.getInstance().info("Resizing done");

      await this.imageAccess.saveThumbnailToS3(
        path.parse(imageId).base,
        convertedBuffer
      );
      Logger.getInstance().info("thumbnail saved");
    } catch (e) {
      throw new Error(e.message);
    }
  }

  getUploadUrl(imageId:string):string
  {
    Logger.getInstance().info('getUploadUrl for', imageId);    
    const uploadUrl = this.imageAccess.getS3UploadUrl(imageId);
    Logger.getInstance().debug('UploadUrl', uploadUrl);
    
    return uploadUrl

  }
}
