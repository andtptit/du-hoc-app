import { getFirestore } from 'firebase/firestore';
import { firebaseApp, firestoreDatabaseId } from './firebaseApp';

export const db = getFirestore(firebaseApp, firestoreDatabaseId);
