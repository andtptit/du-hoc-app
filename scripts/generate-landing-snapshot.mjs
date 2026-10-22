import { readFile, writeFile } from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, getFirestore, terminate } from 'firebase/firestore';

const config = JSON.parse(await readFile(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));
const app = initializeApp(config, 'landing-snapshot-generator');
const db = getFirestore(app, config.firestoreDatabaseId);
const [schoolSnapshot, configSnapshot] = await Promise.all([
  getDocs(collection(db, 'universities')),
  getDoc(doc(db, 'settings', 'costs')),
]);

if (schoolSnapshot.empty) throw new Error('Firestore returned no schools; snapshot was not updated.');

const fields = [
  'id', 'name', 'calcTuitionD4', 'calcTuitionD2_1', 'calcTuitionD2_2',
  'calcTuitionD2_3', 'calcTuitionD2_3_no_topik', 'calcTuitionD2_6',
  'applicationFee', 'enrollmentFee', 'dormitory',
];
const universities = schoolSnapshot.docs.map((school) => {
  const data = school.data();
  return Object.fromEntries(fields.filter((field) => data[field] !== undefined).map((field) => [field, data[field]]));
});
const snapshot = {
  generatedAt: new Date().toISOString(),
  universities,
  globalConfig: configSnapshot.exists() ? configSnapshot.data() : null,
};
await writeFile(new URL('../src/landing-snapshot.json', import.meta.url), `${JSON.stringify(snapshot)}\n`, 'utf8');
console.log(`Saved ${universities.length} schools to src/landing-snapshot.json`);
await terminate(db);
