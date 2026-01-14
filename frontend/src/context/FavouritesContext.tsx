import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { FavouriteDTO } from "../dtos/FavouriteDto";
import { favouriteService } from "../services/favouriteService";
import { useAuth } from "./AuthContext";

interface FavouritesContextType {
  favourites: FavouriteDTO[];
  favouriteBookIds: Set<number>;
  isLoading: boolean;
  error: string | null;
  addFavourite: (bookId: number) => Promise<void>;
  removeFavourite: (bookId: number) => Promise<void>;
  refetchFavourites: () => void;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(
  undefined
);

interface FavouritesProviderProps {
  children: ReactNode;
}

export const FavouritesProvider: React.FC<FavouritesProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<FavouriteDTO[]>([]);
  const [favouriteBookIds, setFavouriteBookIds] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavourites = useCallback(
    async (isInitialLoad = false) => {
      if (!user) {
        setFavourites([]);
        setFavouriteBookIds(new Set());
        setIsLoading(false);
        return;
      }

      console.log("FavouritesContext: Fetching favourites for user:", user.id);
      if (isInitialLoad) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const data = await favouriteService.getUserFavourites(user.id);
        setFavourites(data);
        setFavouriteBookIds(new Set(data.map((fav) => fav.book.id)));
        console.log("FavouritesContext: Favourites fetched", data);
      } catch (err: any) {
        console.error("FavouritesContext: Error fetching favourites:", err);
        setError("Nie udało się załadować ulubionych książek.");

      } finally {
        if (isInitialLoad) {
          setIsLoading(false);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    fetchFavourites(true);
  }, [fetchFavourites]);

  const addFavourite = async (bookId: number) => {
    if (!user) return;
    console.log("FavouritesContext: Attempting to add favourite:", bookId);
    const previousFavourites = [...favourites];
    const previousBookIds = new Set(favouriteBookIds);

    const tempFavourite: Partial<FavouriteDTO> = {
      id: -Date.now(),
      book: { id: bookId } as any,
      user: { id: user.id } as any,
    };
    setFavourites((prev) => [...prev, tempFavourite as FavouriteDTO]);
    setFavouriteBookIds((prev) => new Set(prev).add(bookId));
    setError(null);

    try {
      const createdFavourite = await favouriteService.addToFavourites(
        bookId,
        user.id
      );
      setFavourites((prev) =>
        prev.map((fav) => (fav.book.id === bookId ? createdFavourite : fav))
      );
      console.log(
        "FavouritesContext: Favourite added successfully and refetched:",
        bookId
      );
    } catch (error) {
      console.error("FavouritesContext: Error adding favourite:", error);
      setError(`Nie udało się dodać książki ${bookId} do ulubionych.`);
      setFavourites(previousFavourites);
      setFavouriteBookIds(previousBookIds);
    }
  };

  const removeFavourite = async (bookId: number) => {
    if (!user) return;
    console.log("FavouritesContext: Attempting to remove favourite:", bookId);
    const previousFavourites = [...favourites];
    const previousBookIds = new Set(favouriteBookIds);

    setFavourites((prev) => prev.filter((fav) => fav.book.id !== bookId));
    setFavouriteBookIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(bookId);
      return newSet;
    });
    setError(null);

    try {
      await favouriteService.removeFromFavourites(bookId, user.id);
      console.log("FavouritesContext: Favourite removed successfully:", bookId);
    } catch (error) {
      console.error("FavouritesContext: Error removing favourite:", error);
      setError(`Nie udało się usunąć książki ${bookId} z ulubionych.`);

      setFavourites(previousFavourites);
      setFavouriteBookIds(previousBookIds);
    }
  };

  const value = {
    favourites,
    favouriteBookIds,
    isLoading,
    error,
    addFavourite,
    removeFavourite,
    refetchFavourites: () => fetchFavourites(false),
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = (): FavouritesContextType => {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error("useFavourites must be used within a FavouritesProvider");
  }
  return context;
};
