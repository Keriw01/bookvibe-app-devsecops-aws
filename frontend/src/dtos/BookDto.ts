
export interface BookDTO {
    id: number;
    title: string;
    author: string;
    releaseDate: string;
    description?: string;
    imageUrl?: string;
    collectionIds?: number [];
}