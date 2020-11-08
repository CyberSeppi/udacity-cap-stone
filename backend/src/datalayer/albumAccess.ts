import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Album } from "../model/Album";
import { Logger } from "../utils/myLogger";

const AWSXRay = require("aws-xray-sdk");

const XAWS = AWSXRay.captureAWS(AWS);

export class AlbumAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly tableAlbum = process.env.TABLE_ALBUMS,
    private readonly tableAlbumSecIdx = process.env.TABLE_ALBUMS_ID_INDEX
  ) {}

  async getAlbum(userId: string, albumId: string): Promise<Album> {
    Logger.getInstance().info("Get Album", userId, albumId);

    try {
      const queryParams = {
        TableName: this.tableAlbum,
        KeyConditionExpression: "userId = :userId and albumId = :albumId",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":albumId": albumId,
        },
      };

      Logger.getInstance().debug("Querying", queryParams);

      const result = await this.docClient.query(queryParams).promise();

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
      const queryParams = {
        TableName: this.tableAlbum,
        IndexName: this.tableAlbumSecIdx,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      };

      Logger.getInstance().debug("Querying", queryParams);

      const result = await this.docClient.query(queryParams).promise();

      const items = result.Items;
      return items as Album[];
    } catch (e) {}
  }

  /**
   * Create a new album.
   * @param album will be created.
   */
  async createAlbum(album: Album): Promise<Album> {
    const params = {
      TableName: this.tableAlbum,
      Item: album,
    };

    Logger.getInstance().debug('Put params', params);
    
    await this.docClient
      .put(params)
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
      const params = {
        TableName: this.tableAlbum,
        Key: { userId: userId, albumId: albumId },
        ReturnValues: "ALL_OLD",
      };

      Logger.getInstance().debug('Delete Params', params);
      
      await this.docClient
        .delete(params)
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
