# Book Vibe

## Wymagania wstępne

Aby uruchomić projekt, upewnij się, że masz zainstalowane następujące narzędzia:

1. **Java Development Kit (JDK)** - Wersja 17 lub nowsza (Spring Boot 3.x wymaga JDK 17+).
   - Pobierz z [oficjalnej strony Oracle](https://www.oracle.com/java/technologies/javase-jdk17-downloads.html) lub użyj OpenJDK.
2. **Maven** - Narzędzie do zarządzania zależnościami (zwykle wbudowane w projekt, ale możesz zainstalować je ręcznie).
   - Pobierz z [oficjalnej strony Maven](https://maven.apache.org/download.cgi).
3. **Visual Studio Code** - Edytor kodu.
   - Pobierz z [oficjalnej strony VS Code](https://code.visualstudio.com/).
4. **Rozszerzenia VS Code**:
   - **Java Extension Pack** - Zawiera zestaw narzędzi do pracy z Javą (np. IntelliSense, debugowanie).
   - **Spring Boot Extension Pack** - Dodaje wsparcie dla Spring Boot (np. podgląd konfiguracji, uruchamianie).

## Kroki do uruchomienia projektu

### 1. Sklonuj repozytorium
Sklonuj projekt za pomocą Git:
```bash
git clone <URL_REPOZYTORIUM>
```

### 2. Otwórz projekt w Visual Studio Code

### 3. Zainstaluj zależności
Projekt używa Mavena, więc otwórz terminal w VS Code (`Terminal > New Terminal`) i wykonaj:
```bash
mvn clean install
```
To pobierze wszystkie zależności określone w pliku `pom.xml`.

### 4. Skonfiguruj środowisko
Upewnij się, że zmienna środowiskowa `JAVA_HOME` jest ustawiona na katalog instalacyjny JDK. W terminalu możesz sprawdzić to poleceniem:
- Windows: `echo %JAVA_HOME%`
- Linux/Mac: `echo $JAVA_HOME`

Jeśli nie jest ustawiona, dodaj ją ręcznie w ustawieniach systemowych.
- Włącz lokalnie w XAMPP usługę Apache oraz MySQL

- W Docker uruchom serwer Redis: 

    ```bash docker run -d --name my-redis -p 6379:6379 redis```

### 5. Uruchom aplikację
W VS Code możesz uruchomić projekt na kilka sposobów:
- **Z terminalu**: W folderze projektu wpisz:
  ```bash
  mvn spring-boot:run

  mvn clean install -DskipTests
  ```
- **Z poziomu kodu**: 
  1. Otwórz plik główny aplikacji (np. `src/main/java/com/example/demo/DemoApplication.java`).
  2. Kliknij prawym przyciskiem myszy i wybierz `Run Java` lub użyj przycisku "Run" (zielony trójkąt) w górnym rogu.

### 6. Sprawdź działanie
Po uruchomieniu aplikacja domyślnie działa na porcie `8080`.
Endpointy, można przetestować za pomocą Postmana. http://localhost:8080/api/books

## Dodatkowe informacje
- Wersja Java: 21.0.6
- Wersja Maven: 3.9.9
- Wersja Spring Boot: 3.4.3

## API Ulubionych Książek (`/api/favourites`)

Endpointy do zarządzania listą ulubionych książek użytkowników.

**Uwagi:**

*   Zastąp `http://localhost:8080` bazowym adresem URL Twojego API.
*   Zastąp przykładowe wartości `{userId}` i `{bookId}` (np. `5`, `1`) prawidłowymi identyfikatorami z Twojej bazy danych.
*   Jeśli Twoje API wymaga autentykacji (np. token JWT), pamiętaj o dodaniu odpowiedniego nagłówka `Authorization` do każdego zapytania.

---

### 1. Dodawanie książki do ulubionych

Dodaje określoną książkę do listy ulubionych danego użytkownika. Zwraca dodany (lub już istniejący) wpis ulubionego.

*   **Metoda:** `POST`
*   **URL:** `/api/favourites`
*   **Parametry (Query Params):**
    *   `bookId` (Long): ID książki do dodania.
    *   `userId` (Integer): ID użytkownika.
*   **Przykład zapytania:**
    ```
    POST http://localhost:8080/api/favourites?bookId=1&userId=5
    ```
*   **Przykładowa odpowiedź (Sukces `200 OK`):**
    ```json
    {
        "id": 101,
        "book": {
            "id": 1,
            "title": "Władca Pierścieni: Drużyna Pierścienia",
            "author": "J.R.R. Tolkien"
        },
        "user": {
            "id": 5,
            "username": "czytelnik123",
            "email": "czytelnik@example.com"
        }
    }
    ```
*   **Przykładowa odpowiedź (Błąd):**
    *   `404 Not Found`: Jeśli książka lub użytkownik o podanym ID nie istnieje.

---

### 2. Usuwanie książki z ulubionych

Usuwa określoną książkę z listy ulubionych danego użytkownika.

*   **Metoda:** `DELETE`
*   **URL:** `/api/favourites`
*   **Parametry (Query Params):**
    *   `bookId` (Long): ID książki do usunięcia.
    *   `userId` (Integer): ID użytkownika.
*   **Przykład zapytania:**
    ```
    DELETE http://localhost:8080/api/favourites?bookId=1&userId=5
    ```
*   **Przykładowa odpowiedź (Sukces):**
    *   `204 No Content` (Brak ciała odpowiedzi)
*   **Przykładowa odpowiedź (Błąd):**
    *   `404 Not Found`: Jeśli użytkownik o podanym ID nie istnieje (zgodnie z logiką sprawdzania w serwisie przed usunięciem).

---

### 3. Pobieranie listy ulubionych użytkownika

Pobiera listę wszystkich książek dodanych do ulubionych przez określonego użytkownika.

*   **Metoda:** `GET`
*   **URL:** `/api/favourites/user/{userId}`
*   **Parametry (Path Variable):**
    *   `{userId}` (Integer): ID użytkownika, którego ulubione chcemy pobrać.
*   **Przykład zapytania:**
    ```
    GET http://localhost:8080/api/favourites/user/5
    ```
*   **Przykładowa odpowiedź (Sukces `200 OK`):**
    ```json
    [
        {
            "id": 101,
            "book": { "id": 1, "title": "Władca Pierścieni: Drużyna Pierścienia", "author": "J.R.R. Tolkien" },
            "user": { "id": 5, "username": "czytelnik123", "email": "czytelnik@example.com" }
        },
        {
            "id": 105,
            "book": { "id": 22, "title": "Diuna", "author": "Frank Herbert" },
            "user": { "id": 5, "username": "czytelnik123", "email": "czytelnik@example.com" }
        }
    ]
    ```
    *(Odpowiedź może być pustą tablicą `[]`, jeśli użytkownik nie ma ulubionych).*
*   **Przykładowa odpowiedź (Błąd):**
    *   `404 Not Found`: Jeśli użytkownik o podanym ID nie istnieje.

---

### 4. Sprawdzanie statusu ulubionego

Sprawdza, czy dana książka znajduje się na liście ulubionych konkretnego użytkownika.

*   **Metoda:** `GET`
*   **URL:** `/api/favourites/check`
*   **Parametry (Query Params):**
    *   `bookId` (Long): ID sprawdzanej książki.
    *   `userId` (Integer): ID sprawdzanego użytkownika.
*   **Przykład zapytania:**
    ```
    GET http://localhost:8080/api/favourites/check?bookId=1&userId=5
    ```
*   **Przykładowa odpowiedź (Sukces `200 OK`):**
    ```json
    true
    ```
    lub
    ```json
    false
    ```
*   **Przykładowa odpowiedź (Błąd):** Ten endpoint zazwyczaj nie zwraca błędu 404, a jedynie `false`, jeśli wpis nie istnieje.

---