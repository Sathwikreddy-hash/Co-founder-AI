import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Map username to a fake email for Firebase Auth
const getEmailFromUsername = (username: string) => `${username.toLowerCase().trim()}@aicofounder.internal`;

export const signUpWithUsername = (username: string, password: string) => {
  const email = getEmailFromUsername(username);
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithUsername = (username: string, password: string) => {
  const email = getEmailFromUsername(username);
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
