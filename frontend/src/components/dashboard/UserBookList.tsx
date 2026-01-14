import React, { useState, useEffect, useCallback } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardImage,
  MDBBtn,
  MDBSpinner,
  MDBListGroup,
  MDBListGroupItem,
  MDBIcon,
} from "mdb-react-ui-kit";
import { collectionService } from "../../services/collectionService";
import { CollectionDTO } from "../../dtos/CollectionDto";
import { BookDTO } from "../../dtos/BookDto";
import { useFavourites } from "../../context/FavouritesContext";

const generatePlaceholderUrl = (title: string, width = 600, height = 400) => {
  const cleanTitle = title;
  const encodedTitle = encodeURIComponent(cleanTitle);
  return `https://placehold.co/${width}x${height}/EFEFEF/777777?text=${encodedTitle}`;
};

const UserBookList = () => {
  const {
    favouriteBookIds,
    addFavourite,
    removeFavourite,
    isLoading: loadingFavouritesContext,
  } = useFavourites();

  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [errorCollections, setErrorCollections] = useState<string | null>(null);

  const [selectedCollection, setSelectedCollection] =
    useState<CollectionDTO | null>(null);
  const [booksInCollection, setBooksInCollection] = useState<BookDTO[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [errorBooks, setErrorBooks] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoadingCollections(true);
    setErrorCollections(null);
    setSelectedCollection(null);
    setBooksInCollection([]);
    try {
      console.log("UserBookList: Fetching collections...");
      const data = await collectionService.getAll();
      if (Array.isArray(data)) {
        const sortedCollections = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setCollections(sortedCollections);
      } else {
        console.error(
          "UserBookList: Otrzymano nieprawidłowe dane dla kolekcji:",
          data
        );
        setCollections([]);
        setErrorCollections(
          "Otrzymano nieprawidłowy format danych kolekcji z serwera."
        );
      }
    } catch (err: any) {
      const message = err.message || "Wystąpił błąd podczas ładowania kolekcji";
      setErrorCollections(message);
      setCollections([]);
      console.error("UserBookList: Error fetching collections:", err);
    } finally {
      setLoadingCollections(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const fetchBooksForCollection = async (collectionId: number) => {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    setLoadingBooks(true);
    setErrorBooks(null);
    setSelectedCollection(collection);
    setBooksInCollection([]);
    try {
      console.log(
        `UserBookList: Fetching books for collection ID: ${collectionId}`
      );
      const data = await collectionService.getBooksInCollection(collectionId);
      if (Array.isArray(data)) {
        const sortedBooks = data.sort((a, b) => a.title.localeCompare(b.title));
        setBooksInCollection(sortedBooks);
      } else {
        console.error(
          `UserBookList: Otrzymano nieprawidłowe dane dla książek w kolekcji ${collectionId}:`,
          data
        );
        setBooksInCollection([]);
        setErrorBooks(
          "Otrzymano nieprawidłowy format danych książek z serwera."
        );
      }
    } catch (err: any) {
      const message =
        err.message ||
        "Wystąpił błąd podczas ładowania książek dla tej kolekcji";
      setErrorBooks(message);
      setBooksInCollection([]);
      console.error(
        `UserBookList: Error fetching books for collection ${collectionId}:`,
        err
      );
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setBooksInCollection([]);
    setErrorBooks(null);
  };

  const handleToggleFavourite = async (bookId: number) => {
    const isCurrentlyFavourite = favouriteBookIds.has(bookId);
    try {
      if (isCurrentlyFavourite) {
        console.log(
          `UserBookList: Removing book ${bookId} from favourites via context`
        );
        await removeFavourite(bookId);
      } else {
        console.log(
          `UserBookList: Adding book ${bookId} to favourites via context`
        );
        await addFavourite(bookId);
      }
    } catch (error) {
      console.error(
        "UserBookList: Error toggling favourite via context:",
        error
      );
    }
  };

  if (loadingCollections) {
    return (
      <div className="text-center mt-5">
        <MDBSpinner role="status">
          <span className="visually-hidden">Ładowanie kolekcji...</span>
        </MDBSpinner>
        <p className="mt-2">Ładowanie kolekcji...</p>
      </div>
    );
  }

  if (errorCollections) {
    return <div className="alert alert-danger mt-3">{errorCollections}</div>;
  }

  return (
    <MDBContainer>
      {selectedCollection ? (
        <div className="d-flex align-items-center mb-3">
          <MDBBtn
            floating
            tag="a"
            color="secondary"
            size="sm"
            className="me-3"
            onClick={handleBackToCollections}
          >
            <MDBIcon fas icon="arrow-left" />
          </MDBBtn>
          <h2>Książki w kolekcji: {selectedCollection.name}</h2>
        </div>
      ) : (
        <h2>Twoje Kolekcje</h2>
      )}

      {selectedCollection && (
        <div>
          {loadingBooks && (
            <div className="text-center mt-4">
              <MDBSpinner role="status">
                <span className="visually-hidden">Ładowanie książek...</span>
              </MDBSpinner>
              <p className="mt-2">Ładowanie książek...</p>
            </div>
          )}
          {errorBooks && (
            <div className="alert alert-danger mt-3">{errorBooks}</div>
          )}

          {!loadingBooks &&
            !errorBooks &&
            (booksInCollection.length > 0 ? (
              <MDBRow className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mt-1">
                {booksInCollection.map((book) => {
                  const isFavourite = favouriteBookIds.has(book.id);
                  const imageUrl = book.imageUrl
                    ? book.imageUrl
                    : generatePlaceholderUrl(book.title);

                  return (
                    <MDBCol key={book.id}>
                      <MDBCard className="h-100 shadow-sm position-relative">
                        <MDBCardImage
                          src={imageUrl}
                          alt={`Okładka ${book.title}`}
                          position="top"
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                        <MDBBtn
                          floating
                          tag="a"
                          color={isFavourite ? "danger" : "light"}
                          size="sm"
                          onClick={() => handleToggleFavourite(book.id)}
                          disabled={loadingFavouritesContext}
                          title={
                            isFavourite
                              ? "Usuń z ulubionych"
                              : "Dodaj do ulubionych"
                          }
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            zIndex: 1,
                          }}
                        >
                          <MDBIcon fas icon="heart" />
                        </MDBBtn>
                        <MDBCardBody className="d-flex flex-column p-2">
                          <MDBCardTitle
                            style={{ fontSize: "0.9rem", marginBottom: "5px" }}
                          >
                            {book.title}
                          </MDBCardTitle>
                          <MDBCardText
                            style={{ fontSize: "0.8rem", marginBottom: "auto" }}
                          >
                            {book.author}
                          </MDBCardText>
                        </MDBCardBody>
                      </MDBCard>
                    </MDBCol>
                  );
                })}
              </MDBRow>
            ) : (
              <p className="text-center mt-4">Brak książek w tej kolekcji.</p>
            ))}
        </div>
      )}

      {!selectedCollection &&
        (collections.length > 0 ? (
          <MDBListGroup className="mt-3">
            {collections.map((collection) => (
              <MDBListGroupItem
                key={collection.id}
                action
                onClick={() => fetchBooksForCollection(collection.id)}
                className="d-flex justify-content-between align-items-center cursor-pointer"
              >
                {collection.name}
                <MDBIcon fas icon="chevron-right" />
              </MDBListGroupItem>
            ))}
          </MDBListGroup>
        ) : (
          <p className="text-center mt-4">
            Nie utworzono jeszcze żadnych kolekcji.
          </p>
        ))}
    </MDBContainer>
  );
};

export default UserBookList;
