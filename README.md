# Frontend Aplikacji do Automatyzacji Procesów Biurokratycznych

Ten projekt stanowi frontend aplikacji mobilnej wspierającej automatyzację procesów biurokratycznych, takich jak generowanie, podpisywanie i wysyłanie dokumentów (umowy, faktury, oferty, raporty). Aplikacja została zbudowana w technologii **React Native** z użyciem **Expo CLI**, umożliwiając rozwój na platformy Android i iOS.

## Cel aplikacji

Aplikacja ma na celu:
- Automatyzację procesów związanych z tworzeniem, podpisywaniem i wysyłaniem dokumentów.
- Minimalizację błędów ludzkich poprzez wykorzystanie predefiniowanych szablonów i automatycznego wypełniania danych.
- Oszczędność czasu dzięki intuicyjnemu interfejsowi.
- Zapewnienie zgodności z przepisami prawa, w tym RODO.

## Główne funkcje

### 1. Generowanie dokumentów
- **Szablony dokumentów**: Biblioteka predefiniowanych szablonów (umowy, faktury, oferty, raporty) z możliwością dostosowania przez administratorów lub tworzenia własnych szablonów.
- **Formularze danych**: Intuicyjne formularze umożliwiające wprowadzanie danych, takich jak:
  - Nazwa i adres firmy
  - NIP
  - Szczegóły umowy (okres obowiązywania, warunki płatności)
  - Kwoty i waluta (dla faktur)
  - Szczegóły oferty
- **Automatyczne wypełnianie**: Dane wprowadzone przez użytkownika są automatycznie wstawiane w odpowiednie miejsca w szablonie.
- **Eksport dokumentów**: Generowanie dokumentów w formacie PDF, gotowych do podpisania lub wysyłki.

### 2. Podpisywanie elektroniczne
- **Integracja z platformami**: Obsługa podpisu elektronicznego.
- **Proces podpisywania**: Użytkownik wybiera dokument i podpisuje go elektronicznie.

### 3. Autouzupełnianie danych
- **AsyncStorage**: Dane użytkownika (np. nazwa firmy, NIP) są zapisywane lokalnie, umożliwiając autouzupełnianie formularzy.
- **Hook useEffect**: Aplikacja wczytuje wcześniej zapisane dane przy uruchamianiu formularzy.

### 4. Obsługa logotypów i dostępności
- **Logotypy firmowe**: Możliwość dodawania niestandardowych logotypów do dokumentów.
- **Polskie znaki**: Pełna obsługa znaków UTF-8 (np. ą, ć, ł, ó).
- **Dostępność**: Etykiety TalkBack (Android) dla osób z niepełnosprawnościami (do wdrożenia w końcowej fazie).

## Architektura aplikacji

### Frontend
- **Technologie**:
  - **React Native** + **Expo CLI**: Framework do tworzenia aplikacji mobilnych na Android i iOS.
  - **React Navigation**: Nawigacja między ekranami aplikacji.
  - **Axios**: Komunikacja z backendem poprzez RESTful API.
  - **React Native Paper**: Biblioteka komponentów UI dla spójnego i nowoczesnego interfejsu.
- **Funkcjonalności Expo**:
  - Dostęp do kamery, lokalizacji i powiadomień push.
  - Szybkie prototypowanie i testowanie aplikacji.

### Backend (powiązany)
- **Node.js + Express**: RESTful API obsługujące logikę biznesową.
- **PostgreSQL**: Baza danych przechowująca dane użytkowników, dokumenty i statusy.
- **Hosting**: Baza danych hostowana na platformie **Supabase**.

## Bezpieczeństwo

- **Szyfrowanie SSL/TLS**: Wszystkie dane przesyłane między frontendem a backendem są szyfrowane.
- **Autoryzacja JWT**: Tokeny JWT do logowania i autentykacji użytkowników, odświeżane co 24 godziny.
- **Szyfrowanie haseł**: Hasła użytkowników szyfrowane za pomocą **bcrypt**.
- **Zabezpieczenie PDF**: Pliki PDF zabezpieczone hashem SHA-256, weryfikowanym przy każdym otwarciu.
- **Zgodność z RODO**: System zapewnia ochronę danych osobowych zgodnie z przepisami.

## Konfiguracja

1. **Utwórz plik `.env`** w głównym katalogu projektu z następującymi zmiennymi:
   ```env
   API_URL=http://your-backend-url

## Zainstaluj Expo CLI:
bash

npm install -g expo-cli

## Sklonuj repozytorium:
bash

git clone <repository_url>
cd frontend

## Zainstaluj zależności:
bash

npm install

## Uruchom aplikację:
bash

expo start

## Użyj aplikacji Expo Go na urządzeniu mobilnym lub emulatorze, aby przetestować aplikację.


## Generowanie dokumentów
- Użytkownik wprowadza dane w formularzu.

- Aplikacja wstawia dane do wybranego szablonu.

- Dokument jest generowany w formacie PDF i zapisywany w systemie.

- Użytkownik otrzymuje dostęp do pliku.

### Technologie i narzędzia
## Frontend:
- React Native + Expo CLI

- React Navigation

- Axios

- React Native Paper

## Bezpieczeństwo:
- SSL/TLS

- JWT + OAuth 2.0

- Bcrypt

- SHA-256 (dla PDF)

## Plany rozwoju
- Wdrożenie etykiet TalkBack dla pełnej dostępności.

- Dodanie wsparcia dla niestandardowych motywów UI.

- Rozszerzenie integracji z kolejnymi platformami podpisu elektronicznego.

## Kontakt
W razie pytań skontaktuj się z zespołem deweloperskim: mikolajmelnyk16@gmail.com


