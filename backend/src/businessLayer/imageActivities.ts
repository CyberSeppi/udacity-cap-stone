import { ImageAccess } from "../datalayer/imageAccess";
import { Image } from "../model/Image";
import * as uuid from "uuid";

export class ImageActivities {
  imageAccess: ImageAccess;

  bucketName: string;

  constructor() {
    this.imageAccess = new ImageAccess();
    this.bucketName = process.env.IMAGES_S3_BUCKET;
  }

  async createImage(userId: string, albumId: string): Promise<Image> {
    const imageId = uuid.v4();

    try {
        
      const image: Image = {
        imageId: imageId,
        createdAt: new Date().toISOString(),
        url: `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
        userId: userId,
        albumId: albumId,
        description: "",
      };
      return this.imageAccess.createImage(image);

    } catch (e) {
        throw new Error(e.message)
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
}
