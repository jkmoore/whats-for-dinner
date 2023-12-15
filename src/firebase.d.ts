import { Firestore, Auth } from 'firebase/auth';

declare module "./firebase" {
  export const auth: Auth;
  export const firestore: Firestore;
}
