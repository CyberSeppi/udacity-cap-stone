import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Album } from "../model/Album";

const AWSXRay = require("aws-xray-sdk");

const XAWS = AWSXRay.captureAWS(AWS);


export class AlbumAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly tableAlbum = process.env.TABLE_ALBUMS,
    private readonly tableAlbumSecIdx = process.env.TABLE_ALBUMS_ID_INDEX
  ) {}

  async getAlbum(userId: string, albumId: string): Promise<Album> {
    try {
      const result = await this.docClient
        .query({
          TableName: this.tableAlbum,
          KeyConditionExpression: "userId = :userId and albumId = :albumId",
          ExpressionAttributeValues: {
            ":userId": userId,
            ":albumId": albumId,
          },
        })
        .promise();

      const items = result.Items;

      if (items[0]) {
        return items[0] as Album;
      }

      throw new Error(`album ${albumId} not found`);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * Get all album information for a specific user id
   * @param userId key for request all album information
   * @return list of album for the given userId
   */
  async getAllAlbums(userId: string): Promise<Album[]> {
    try {
      const result = await this.docClient
        .query({
          TableName: this.tableAlbum,
          IndexName: this.tableAlbumSecIdx,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
        })
        .promise();

      const items = result.Items;
      return items as Album[];
    } catch (e) {
    }
  }

  /**
   * Create a new album.
   * @param album will be created.
   */
  async createAlbum(album: Album): Promise<Album> {
    await this.docClient
      .put({
        TableName: this.tableAlbum,
        Item: album,
      })
      .promise();

    return album;
  }

  /**
   * Delete an album of a user
   * @param albumId the id of the album
   * @param userId the user id
   *
   */
  async deleteAlbum(albumId: string, userId: string) {

    try {
      await this.docClient
        .delete({
          TableName: this.tableAlbum,
          Key: { userId: userId, albumId: albumId },
          ReturnValues: "ALL_OLD",
        })
        .promise();

    } catch (e) {
      throw new Error(e.message);
    }
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
