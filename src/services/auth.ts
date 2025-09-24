import { ERROR_MESSAGES, UNKNOWN_ERROR_MESSAGE } from "constants/authErrors";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, User } from "firebase/auth";
import { auth } from "./firebase";

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const registerUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error(error);
    const message = ERROR_MESSAGES[error.code] || UNKNOWN_ERROR_MESSAGE;
    return { success: false, error: message }
  }
}

export const sendVerificationEmail = async (user: User): Promise<boolean> => {
  try {
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};
