import {Image} from './Image'

export interface Album {
  albumId: string
  name: string
  description?: string
  userId: string
  createdAt: string
  images?:Image[]
}
