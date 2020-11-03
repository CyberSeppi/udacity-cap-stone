export interface Image {
    userId: string
    albumId: string
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
