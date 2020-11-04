import * as uuid from "uuid";
import { Album } from "../model/Album";
import { AlbumAccess } from "../datalayer/albumAccess";
import { ImageAccess } from "../datalayer/imageAccess";

export class AlbumActivities {
  private albumAccess: AlbumAccess;
  private imageAccess: ImageAccess;

  constructor() {
    this.albumAccess = new AlbumAccess();
    this.imageAccess = new ImageAccess();
  }

  async getAlbums(userId:string):Promise<Album[]>{
    return await this.albumAccess.getAllAlbums(userId)
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

    try {
      const album = await this.albumAccess.getAlbum(userId, albumId);
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
//TODO
    return null;
  }

  async deleteAlbum(userId: string, albumId: string) {

    try {
      //see, if the album is existing. If not error is thrown in datalayer
      const albumToBeDeleted = await this.getAlbum(userId, albumId);

      await this.albumAccess.deleteAlbum(albumToBeDeleted.albumId, albumToBeDeleted.userId);

      //deleting images

      for (let index = 0; index < albumToBeDeleted.images.length; index++) {
        const image = albumToBeDeleted.images[index]
        await this.imageAccess.deleteimage(image.albumId, image.imageId)
      }

    } catch (e) {
      throw new Error(e.message);
    }
  }
}
