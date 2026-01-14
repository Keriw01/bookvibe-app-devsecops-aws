import React, { useState, useEffect, useCallback } from "react";
import {
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBInput,
  MDBSpinner,
  MDBIcon,
} from "mdb-react-ui-kit";
import { bookService } from "../../services/bookService";
import { collectionService } from "../../services/collectionService";
import { BookDTO } from "../../dtos/BookDto";
import { CollectionDTO } from "../../dtos/CollectionDto";

type BookInput = Omit<BookDTO, "id" | "collections">;

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBook, setNewBook] = useState<BookInput>({
    title: "",
    author: "",
    description: "",
    releaseDate: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<BookDTO | null>(null);
  const [bookCollections, setBookCollections] = useState<number[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchBooksAndCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [booksData, collectionsData] = await Promise.all([
        bookService.getAll(),
        collectionService.getAll(),
      ]);
      setBooks(booksData);
      setCollections(collectionsData);
    } catch (err) {
      setError("Nie udało się załadować danych (książki lub kolekcje).");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooksAndCollections();
  }, [fetchBooksAndCollections]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (editingBook) {
      setEditingBook((prev) => (prev ? { ...prev, [name]: value } : null));
    } else {
      setNewBook({ ...newBook, [name]: value });
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) {
      setError("Tytuł i autor książki są wymagani.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await bookService.create(newBook);
      setNewBook({ title: "", author: "", description: "", releaseDate: "" });
      await fetchBooksAndCollections();
    } catch (err) {
      setError("Nie udało się dodać książki.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (
      window.confirm(
        "Czy na pewno chcesz usunąć tę książkę? Spowoduje to również usunięcie jej ze wszystkich kolekcji."
      )
    ) {
      setIsLoading(true);
      setError(null);
      try {
        await bookService.delete(id);
        await fetchBooksAndCollections();
      } catch (err) {
        setError("Nie udało się usunąć książki.");
        console.error(err);
        setIsLoading(false);
      }
    }
  };

  const openEditModal = async (book: BookDTO) => {
    try {
      setEditingBook(book);
      setBookCollections(book.collectionIds || []);
      setEditError(null);
      setShowEditModal(true);
    } catch (err) {
      console.error("Error fetching book details for edit:", err);
      setError("Nie udało się załadować szczegółów książki do edycji.");
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingBook(null);
    setBookCollections([]);
    setEditError(null);
  };

  const handleCollectionCheckboxChange = (
    collectionId: number,
    isChecked: boolean
  ) => {
    setBookCollections((prev) =>
      isChecked
        ? [...prev, collectionId]
        : prev.filter((id) => id !== collectionId)
    );
  };

  const handleSaveChanges = async () => {
    if (!editingBook) return;
    if (!editingBook.title || !editingBook.author) {
      setEditError("Tytuł i autor są wymagani.");
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const {
        id,
        collectionIds: currentCollectionIdsInDto,
        ...updateData
      } = editingBook;
      await bookService.update(id, updateData);

      const originalCollectionIds = currentCollectionIdsInDto || [];
      const newCollectionIds = bookCollections;

      const collectionsToAdd = newCollectionIds.filter(
        (cid) => !originalCollectionIds.includes(cid)
      );
      const collectionsToRemove = originalCollectionIds.filter(
        (cid) => !newCollectionIds.includes(cid)
      );

      await Promise.all([
        ...collectionsToAdd.map((cid) =>
          bookService.addBookToCollection(id, cid)
        ),
        ...collectionsToRemove.map((cid) =>
          bookService.removeBookFromCollection(id, cid)
        ),
      ]);

      closeEditModal();
      await fetchBooksAndCollections();
    } catch (err) {
      console.error("Error saving book changes:", err);
      setEditError("Nie udało się zapisać zmian.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value, 10)
    );
    setBookCollections(selectedIds);
  };

  return (
    <div className="mt-4">
      <h3>Zarządzaj Książkami</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleAddBook} className="mb-4 p-3 border rounded">
        <h5>Dodaj nową książkę</h5>
        <MDBInput
          label="Tytuł"
          name="title"
          value={newBook.title}
          onChange={handleInputChange}
          required
          className="mb-3"
        />
        <MDBInput
          label="Autor"
          name="author"
          value={newBook.author}
          onChange={handleInputChange}
          required
          className="mb-3"
        />
        <MDBInput
          label="Data wydania (opcjonalnie)"
          type="date"
          name="releaseDate"
          value={newBook.releaseDate || ""}
          onChange={handleInputChange}
          className="mb-3"
        />
        <MDBInput
          label="Opis (opcjonalnie)"
          name="description"
          value={newBook.description}
          onChange={handleInputChange}
          className="mb-3"
        />{" "}
        <MDBBtn type="submit" disabled={isLoading}>
          {isLoading && <MDBSpinner size="sm" tag="span" className="me-2" />}
          Dodaj książkę
        </MDBBtn>
      </form>

      {isLoading && books.length === 0 && (
        <div className="text-center">
          <MDBSpinner />
        </div>
      )}
      <MDBTable align="middle" responsive>
        <MDBTableHead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Tytuł</th>
            <th scope="col">Autor</th>
            <th scope="col">Data wydania</th>
            <th scope="col">Akcje</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.releaseDate || "-"}</td>
              <td>
                <MDBBtn
                  color="link"
                  size="sm"
                  onClick={() => openEditModal(book)}
                  disabled={isLoading || showEditModal}
                >
                  <MDBIcon fas icon="edit" /> Edytuj
                </MDBBtn>
                <MDBBtn
                  color="link"
                  size="sm"
                  className="text-danger"
                  onClick={() => handleDeleteBook(book.id)}
                  disabled={isLoading || showEditModal}
                >
                  <MDBIcon fas icon="trash" /> Usuń
                </MDBBtn>
              </td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>

      {showEditModal && editingBook && (
        <div style={modalStyle} onClick={closeEditModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h4>Edytuj książkę</h4>
              <button
                onClick={closeEditModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            {editError && <div className="alert alert-danger">{editError}</div>}

            <div className="mb-3">
              <label htmlFor="edit-title" className="form-label">
                Tytuł
              </label>
              <input
                id="edit-title"
                type="text"
                className="form-control"
                name="title"
                value={editingBook.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="edit-author" className="form-label">
                Autor
              </label>
              <input
                id="edit-author"
                type="text"
                className="form-control"
                name="author"
                value={editingBook.author}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="edit-releaseDate" className="form-label">
                Data wydania
              </label>
              <input
                id="edit-releaseDate"
                type="date"
                className="form-control"
                name="releaseDate"
                value={editingBook.releaseDate || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="edit-description" className="form-label">
                Opis
              </label>
              <textarea
                id="edit-description"
                className="form-control"
                name="description"
                value={editingBook.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <hr />
            <h5>Przypisz do kolekcji:</h5>
            {collections.length === 0 && <p>Brak dostępnych kolekcji.</p>}

            <div className="row">
              <div className="mb-3">
                <label htmlFor="edit-collections" className="form-label">
                  Kolekcje (przytrzymaj Ctrl/Cmd, aby wybrać wiele)
                </label>
                <select
                  multiple
                  className="form-select"
                  id="edit-collections"
                  value={bookCollections.map(String)}
                  onChange={handleMultiSelectChange}
                  size={5}
                  style={{ height: "auto" }}
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button className="btn btn-secondary" onClick={closeEditModal}>
                Anuluj
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveChanges}
                disabled={isSavingEdit}
              >
                {isSavingEdit ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Zapisywanie...
                  </>
                ) : (
                  "Zapisz zmiany"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyle: React.CSSProperties = {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "5px",
  width: "80%",
  maxWidth: "800px",
  maxHeight: "90vh",
  overflowY: "auto",
};

export default ManageBooks;
