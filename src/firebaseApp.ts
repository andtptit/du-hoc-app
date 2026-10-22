import { getApp, getApps, initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId;
