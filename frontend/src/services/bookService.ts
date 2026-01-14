import axiosInstance from './axiosConfig';
import { BookDTO as BookDTO } from '../dtos/BookDto';
import { CollectionDTO } from '../dtos/CollectionDto';

type BookInput = Omit<BookDTO, 'id' | 'collections'>;

export const bookService = {
  async getAll(): Promise<BookDTO[]> {
    const response = await axiosInstance.get<BookDTO[]>('/api/books');
    return response.data;
  },

  async getById(id: number): Promise<BookDTO> {
      const response = await axiosInstance.get<BookDTO>(`/api/books/${id}`);
      return response.data;
  },


  async create(bookData: BookInput): Promise<BookDTO> {
    const response = await axiosInstance.post<BookDTO>('/api/books', bookData);
    return response.data;
  },

  async update(id: number, bookData: BookInput): Promise<BookDTO> {
    const response = await axiosInstance.put<BookDTO>(`/api/books/${id}`, bookData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/api/books/${id}`);
  },

  async addBookToCollection(bookId: number, collectionId: number): Promise<CollectionDTO> {
    const response = await axiosInstance.post<CollectionDTO>(`/api/collection-books?bookId=${bookId}&collectionId=${collectionId}`);
    return response.data;
  },

  async removeBookFromCollection(bookId: number, collectionId: number): Promise<void> {
     await axiosInstance.delete(`/api/collection-books?bookId=${bookId}&collectionId=${collectionId}`);
  },
};