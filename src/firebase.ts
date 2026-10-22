import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseApp } from './firebaseApp';

export { db } from './firebasePublic';
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
