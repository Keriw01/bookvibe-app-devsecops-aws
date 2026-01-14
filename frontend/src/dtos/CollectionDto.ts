import { BookDTO } from "./BookDto";

export interface CollectionDTO {
    id: number;
    name: string;
    books?: BookDTO[];
}