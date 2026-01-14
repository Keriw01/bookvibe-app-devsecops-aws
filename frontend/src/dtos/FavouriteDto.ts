import { BookDTO } from './BookDto';
import { UserDto } from './UserDto'; 

export interface FavouriteDTO {
    id: number;
    book: BookDTO;
    user: UserDto;
}