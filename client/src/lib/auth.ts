import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User, InsertUser } from "@shared/schema";

const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await updateUserPresence(result.user.uid, true);
    return result.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user profile
    await updateProfile(result.user, { displayName });
    
    // Create user document in Firestore
    await createUserDocument(result.user, displayName);
    
    return result.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = () => {
  signInWithRedirect(auth, googleProvider);
};

export const handleGoogleRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await createUserDocument(result.user);
      await updateUserPresence(result.user.uid, true);
    }
    return result?.user || null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    if (auth.currentUser) {
      await updateUserPresence(auth.currentUser.uid, false);
    }
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const createUserDocument = async (firebaseUser: FirebaseUser, customDisplayName?: string) => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    const userData: InsertUser = {
      email: firebaseUser.email!,
      displayName: customDisplayName || firebaseUser.displayName || firebaseUser.email!.split('@')[0],
      photoURL: firebaseUser.photoURL || undefined,
      isOnline: true,
      lastSeen: new Date(),
    };
    
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  }
};

export const updateUserPresence = async (userId: string, isOnline: boolean) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    isOnline,
    lastSeen: serverTimestamp(),
  });
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
