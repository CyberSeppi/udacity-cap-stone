import * as uuid from "uuid";
import { Album } from "../model/Album";
import { AlbumAccess } from "../datalayer/albumAccess";

export class AlbumActivities {
  private albumAccess: AlbumAccess;

  constructor() {
    this.albumAccess = new AlbumAccess();
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
    console.log(userId);
    console.log(albumId);

    return null;
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
  }
}
