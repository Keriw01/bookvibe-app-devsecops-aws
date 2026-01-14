import React from "react";
import {
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardImage,
  MDBBtn,
  MDBSpinner,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useFavourites } from "../../context/FavouritesContext";

const generatePlaceholderUrl = (title: string, width = 600, height = 400) => {
  const cleanTitle = title;
  const encodedTitle = encodeURIComponent(cleanTitle);
  return `https://placehold.co/${width}x${height}/2f70fa/white?text=${encodedTitle}`;
};

const FavouriteBooksCarousel: React.FC = () => {
  const {
    favourites,
    isLoading,
    error,
    removeFavourite,
    isLoading: loadingFavouritesContext,
  } = useFavourites();

  const handleRemoveFavourite = async (bookId: number) => {
    await removeFavourite(bookId);
  };

  if (isLoading) {
    return (
      <div className="text-center my-3">
        <MDBSpinner size="sm" role="status" className="me-2">
          <span className="visually-hidden">Loading...</span>
        </MDBSpinner>
        Ładowanie ulubionych...
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-warning my-3">{error}</div>;
  }

  if (favourites.length === 0) {
    return (
      <p className="text-muted text-center my-3">
        Nie masz jeszcze ulubionych książek.
      </p>
    );
  }

  const sortedFavourites = [...favourites].sort((a, b) => {
    const titleA = a.book?.title || "";
    const titleB = b.book?.title || "";
    return titleA.localeCompare(titleB);
  });

  return (
    <div className="mt-4 mb-4">
      <h4 className="mb-3">Twoje Ulubione</h4>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          paddingBottom: "15px",
        }}
      >
        {sortedFavourites.map(({ book }) => {
          if (!book) return null;

          const imageUrl = book.imageUrl
            ? book.imageUrl
            : generatePlaceholderUrl(book.title);

          return (
            <MDBCol
              key={book.id}
              style={{ flex: "0 0 auto", width: "280px", marginRight: "15px" }}
            >
              <MDBCard className="h-100 shadow-sm position-relative">
                <MDBCardImage
                  src={imageUrl}
                  alt={`Okładka ${book.title}`}
                  position="top"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <MDBBtn
                  floating
                  tag="a"
                  color="danger"
                  size="sm"
                  onClick={() => handleRemoveFavourite(book.id)}
                  disabled={loadingFavouritesContext}
                  title="Usuń z ulubionych"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 1,
                  }}
                >
                  <MDBIcon fas icon="times" />
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
      </div>
    </div>
  );
};

export default FavouriteBooksCarousel;
