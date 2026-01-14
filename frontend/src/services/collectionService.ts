import axiosInstance from './axiosConfig';
import { CollectionDTO } from '../dtos/CollectionDto';
import { BookDTO } from '../dtos/BookDto';

type CollectionInput = Omit<CollectionDTO, 'id' | 'books'>;

export const collectionService = {
  async getAll(): Promise<CollectionDTO[]> {
    const response = await axiosInstance.get<CollectionDTO[]>('/api/collections');
    return response.data;
  },

  async getBooksInCollection(id: number): Promise<BookDTO[]> {
    const response = await axiosInstance.get<BookDTO[]>(`/api/collections/${id}/books`);
    return response.data;
  },

  async getById(id: number): Promise<CollectionDTO> {
    const response = await axiosInstance.get<CollectionDTO>(`/api/collections/${id}`);
    return response.data;
  },

  async create(collectionData: CollectionInput): Promise<CollectionDTO> {
    console.log(collectionData);
    const response = await axiosInstance.post<CollectionDTO>('/api/collections', collectionData);
    return response.data;
  },

  async update(id: number, collectionData: CollectionInput): Promise<CollectionDTO> {
    const response = await axiosInstance.put<CollectionDTO>(`/api/collections/${id}`, collectionData);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/api/collections/${id}`);
  },
};