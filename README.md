# Udacity Cap-Stone Submission

Hey there, this is my cap-stone project featuring an image gallery.
I'm not a UI guy, so the UI part is missing, but you can test the endpoints with the postman collection in "test-suites" folder.

There are two folders

|Folder| Description  |
|--|--|
|Auth Request |  All Request are authenticated with a pre-request script stored in the globals of the collection itself. I'll explain the config farther down|
|Auth Request Auto-Test|The same as above, but you can run these in an collection runner. There are passing the responses in variables which will be used by the next request|


**Auth variables**
You have to put these into your collection (with the correct values) to get the auth running. I'll give examples which will not run. I'll send you the real values over the submission descriptions

|Vaiable|Example  |
|--|--|
|auth0_domain| udagram-xxxxx-serverless.eu.auth0.com |
|auth0_client_id|6789GHHJJKU88lll625ExPRRtYMxylYYZ4I|
|auth0_client_secret|7sdhf9gfHJKisdhf-07364hHHJJJJJKpiosdagfasgsadgsadügisad|
|auth0_audience|http://udacity-capstone-api/|


**The Test are doing this (this explains the "good" case without errors. Errors are handled, of course, but not shown in diagrams)**

SaveAlbum
```mermaid
sequenceDiagram
Postman->>APIGateway: request to save album with given data
Note right of APIGateway: check Request structure
APIGateway->>Auth: may he do that?
Auth->>APIGateway: Allow
APIGateway->>Lambda: pass on Request and save Album
Lambda->>Postman: return new Album-data
```
SavePicture
```mermaid
sequenceDiagram
Postman->>APIGateway: request to save picture in given album and get upload url
APIGateway->>Auth: may he do that?
Auth->>APIGateway: Allow
APIGateway->>Lambda: pass on Request and save Image in Album
Lambda->>S3: getPresignedUrl
S3->>Lambda:return presignedURL
Lambda->>Postman: return new Image-Data with signedUrl to upload picture to s3
Postman->>S3: upload testimage
S3->>resizePicture: request thumbnail creation
resizePicture->>S3: put thumbnail in seperate folder
```
GetAlbums
```mermaid
sequenceDiagram
Postman->>APIGateway: request all albums
APIGateway->>Auth: may he do that?
Auth->>APIGateway: Allow
APIGateway->>Lambda: pass on Request and get Albums
Lambda->>Postman: return all Albums
```
GetAlbum
```mermaid
sequenceDiagram
Postman->>APIGateway: request images of given album
APIGateway->>Auth: may he do that?
Auth->>APIGateway: Allow
APIGateway->>Lambda: pass on Request and get all images
Lambda->>Postman: return all Images of given album
```
DeletePicture
```mermaid
sequenceDiagram
Postman->>APIGateway: request deletion of given picture
APIGateway->>Auth: may he do that?
Auth->>APIGateway: Allow
APIGateway->>Lambda: pass on Request and delete picture
Lambda->>Postman: return success notification
```
DeleteAlbum
```mermaid
sequenceDiagram
Postman->>APIGateway: request deletion of given album
APIGateway->>Auth: may he do that?
Auth->>APIGateway: Allow
APIGateway->>Lambda: pass on Request and delete album
Lambda->>Postman: return success notification
```

**Future features:**

UI (obviously :-), but only after finishing the UI nanodegree)
UpdateAlbum function

