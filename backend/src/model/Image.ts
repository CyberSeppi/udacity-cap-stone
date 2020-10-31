export interface Image {
    userAlbumId: string
    imageId: string
    createdAt: string
    description?: string
    url: string
    geoPosition?: {
        lat: number,
        lng: number,
        alt: number
    }
}
