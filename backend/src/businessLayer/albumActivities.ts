import * as uuid from "uuid";
import { Album } from "../model/Album";
import { AlbumAccess } from "../datalayer/albumAccess";
import { ImageAccess } from "../datalayer/imageAccess";
import { createLogger } from "../utils/logger";

export class AlbumActivities {
  private albumAccess: AlbumAccess;
  private imageAccess: ImageAccess;

  constructor() {
    this.albumAccess = new AlbumAccess();
    this.imageAccess = new ImageAccess();
  }

  async createAlbum(
    userId: string,
    name: string,
    description: string
  ): Promise<Album> {
    const newAlbum: Album = {
      albumId: uuid.v4(),
      createdAt: new Date().toISOString(),
      name: name,
      userId: userId,
      description: description,
    };

    return this.albumAccess.createAlbum(newAlbum);
  }

  async getAlbum(userId: string, albumId: string): Promise<Album> {
    const logger = createLogger("AlbumActivities");
    logger.info("getAlbum", userId, albumId);

    try {
      const album = await this.albumAccess.getAlbum(userId, albumId);
      logger.debug(`Album ${album} retrieved`);
      if (album) {
        album.images = await this.imageAccess.getAllImages(userId, albumId);
      }
      return album;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateAlbum(
    userId: string,
    albumId: string,
    name: string,
    description: string
  ): Promise<Album> {
    console.log(userId);
    console.log(albumId);
    console.log(name);
    console.log(description);

    return null;
  }

  async deleteAlbum(userId: string, albumId: string) {
    console.log(userId);
    console.log(albumId);

    const logger = createLogger('Delete Album')
    try {
      //see, if the album is existing. If not error is thrown in datalayer
      const albumToBeDeleted = await this.getAlbum(userId, albumId);

      logger.debug(`deleting album ${albumId}`)
      await this.albumAccess.deleteAlbum(albumToBeDeleted.albumId, albumToBeDeleted.userId);
      logger.debug(`deleted album ${albumId}`)

      //deleting images

      for (let index = 0; index < albumToBeDeleted.images.length; index++) {
        const image = albumToBeDeleted.images[index]
        logger.debug(`deleting picture ${image.imageId}`)
        await this.imageAccess.deleteimage(image.albumId, image.imageId)
        logger.debug(`deleted picture ${image.imageId}`)
      }

    } catch (e) {
      throw new Error(e.message);
    }
  }
}
