import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDgDHB_zbxQT_NDljRdh2bIFMXkhqOh6YA',
  authDomain: 'abpm-458513.firebaseapp.com',
  projectId: 'abpm-458513',
  messagingSenderId: '960068924047',
  storageBucket: 'abpm-458513.firebasestorage.app',
  appId: '1:960068924047:android:44cf4deb1651709ad2f6fa',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
