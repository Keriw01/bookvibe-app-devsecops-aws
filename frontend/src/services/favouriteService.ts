import axiosInstance from './axiosConfig';
import { FavouriteDTO } from '../dtos/FavouriteDto';

export const favouriteService = {
  async getUserFavourites(userId: number): Promise<FavouriteDTO[]> {
    const response = await axiosInstance.get<FavouriteDTO[]>(`/api/favourites/user/${userId}`);
    return response.data;
  },

  async isBookInFavourites(bookId: number, userId: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get<boolean>(`/api/favourites/check?bookId=${bookId}&userId=${userId}`);
      return response.data;
    } catch (error) {
        console.error("Error checking favourite status:", error);
        return false;
    }
  },

  async addToFavourites(bookId: number, userId: number): Promise<FavouriteDTO> {
    const response = await axiosInstance.post<FavouriteDTO>(`/api/favourites?bookId=${bookId}&userId=${userId}`);
    return response.data;
  },

  async removeFromFavourites(bookId: number, userId: number): Promise<void> {
    await axiosInstance.delete(`/api/favourites?bookId=${bookId}&userId=${userId}`);
  },
};