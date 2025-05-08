import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// Inicjalizacja obiektu I18n
const i18n = new I18n({
  en: {
    settings: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    resetPassword: 'Reset Password',
    logout: 'Log out',
    appVersion: 'App version',
    soon: 'Coming soon',
    underDev: 'Password reset feature is under development.',
    login: 'Log In',
    createAccount: 'Create Account',
    email: 'Your email address',
    password: 'Enter password',
    accessAccount: 'Access Account',
    manageDocs: 'Manage your documents efficiently',
    documentCategories: 'Document Categories',
    edit: 'Edit',
    preview: 'Preview',
    generate: 'Generate',
    // Kategorie dokumentów
    handloweiOfertowe: 'Commercial and Offer Documents',
    finansowe: 'Financial Documents',
    kadrowe: 'HR and Administrative Documents',
  },
  pl: {
    settings: 'Ustawienia',
    darkMode: 'Tryb ciemny',
    language: 'Język',
    resetPassword: 'Zresetuj hasło',
    logout: 'Wyloguj się',
    appVersion: 'Wersja aplikacji',
    soon: 'Wkrótce dostępne',
    underDev: 'Funkcja resetowania hasła jest w trakcie tworzenia.',
    login: 'Zaloguj się',
    createAccount: 'Utwórz konto',
    email: 'Twój adres e-mail',
    password: 'Wprowadź hasło',
    accessAccount: 'Dostęp do konta',
    manageDocs: 'Zarządzaj dokumentami efektywnie',
    documentCategories: 'Kategorie dokumentów',
    edit: 'Edytuj',
    preview: 'Podgląd',
    generate: 'Generuj',
    // Kategorie dokumentów
    handloweiOfertowe: 'Dokumenty Handlowe i Ofertowe',
    finansowe: 'Dokumenty Finansowe',
    kadrowe: 'Dokumenty Kadrowe i Administracyjne',
  },
});

// Ustawienia i18n
i18n.enableFallback = true; // Włączenie fallbacków
i18n.locale = Localization.locale?.split('-')[0] || 'en'; // np. 'pl-PL' -> 'pl', domyślnie 'en'

console.log('i18n.locale:', i18n.locale);

export default i18n;
