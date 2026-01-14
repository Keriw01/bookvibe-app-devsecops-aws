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
import { collectionService } from "../../services/collectionService";
import { CollectionDTO } from "../../dtos/CollectionDto";

type CollectionInput = Omit<CollectionDTO, "id" | "books">;

const ManageCollections: React.FC = () => {
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCollection, setNewCollection] = useState<CollectionInput>({
    name: "",
  });
  const [editingCollection, setEditingCollection] =
    useState<CollectionDTO | null>(null);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await collectionService.getAll();
      setCollections(data);
    } catch (err) {
      setError("Nie udało się załadować kolekcji.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingCollection) {
      setEditingCollection({ ...editingCollection, [name]: value });
    } else {
      setNewCollection({ ...newCollection, [name]: value });
    }
  };

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollection.name) {
      setError("Nazwa kolekcji jest wymagana.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await collectionService.create(newCollection);
      setNewCollection({ name: "" });
      await fetchCollections();
    } catch (err) {
      setError("Nie udało się dodać kolekcji.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !editingCollection.name) {
      setError("Nazwa edytowanej kolekcji jest wymagana.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { id, books, ...updateData } = editingCollection;
      await collectionService.update(id, updateData);
      setEditingCollection(null);
      await fetchCollections();
    } catch (err) {
      setError("Nie udało się zaktualizować kolekcji.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę kolekcję?")) {
      setIsLoading(true);
      setError(null);
      try {
        await collectionService.delete(id);
        await fetchCollections();
      } catch (err) {
        setError("Nie udało się usunąć kolekcji.");
        console.error(err);
        setIsLoading(false);
      }
    }
  };

  const startEdit = (collection: CollectionDTO) => {
    setEditingCollection(collection);
    setNewCollection({ name: "" });
  };

  const cancelEdit = () => {
    setEditingCollection(null);
  };

  const currentFormData = editingCollection ? editingCollection : newCollection;
  const handleSubmit = editingCollection
    ? handleUpdateCollection
    : handleAddCollection;
  const buttonText = editingCollection ? "Zapisz zmiany" : "Dodaj kolekcję";
  const formTitle = editingCollection
    ? `Edytuj kolekcję: ${editingCollection.name}`
    : "Dodaj nową kolekcję";

  return (
    <div>
      <h3>Zarządzaj Kolekcjami</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded">
        <h5>{formTitle}</h5>
        <MDBInput
          label="Nazwa Kolekcji"
          name="name"
          value={currentFormData.name}
          onChange={handleInputChange}
          required
          className="mb-3"
        />
        <MDBBtn
          type="submit"
          disabled={isLoading}
          color={editingCollection ? "success" : "primary"}
        >
          {isLoading && <MDBSpinner size="sm" tag="span" className="me-2" />}
          {buttonText}
        </MDBBtn>
        {editingCollection && (
          <MDBBtn
            color="secondary"
            onClick={cancelEdit}
            className="ms-2"
            disabled={isLoading}
          >
            Anuluj
          </MDBBtn>
        )}
      </form>

      {isLoading && collections.length === 0 && (
        <div className="text-center">
          <MDBSpinner />
        </div>
      )}
      <MDBTable align="middle" responsive>
        <MDBTableHead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Nazwa</th>
            <th scope="col">Akcje</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {collections.map((col) => (
            <tr key={col.id}>
              <td>{col.id}</td>
              <td>{col.name}</td>
              <td>
                <MDBBtn
                  color="link"
                  size="sm"
                  onClick={() => startEdit(col)}
                  disabled={isLoading || !!editingCollection}
                >
                  <MDBIcon fas icon="edit" />
                </MDBBtn>
                <MDBBtn
                  color="link"
                  size="sm"
                  className="text-danger"
                  onClick={() => handleDeleteCollection(col.id)}
                  disabled={isLoading || !!editingCollection}
                >
                  <MDBIcon fas icon="trash" />
                </MDBBtn>
              </td>
            </tr>
          ))}
          {!isLoading && collections.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center">
                Brak kolekcji do wyświetlenia.
              </td>
            </tr>
          )}
        </MDBTableBody>
      </MDBTable>
    </div>
  );
};

export default ManageCollections;
