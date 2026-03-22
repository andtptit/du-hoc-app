/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, doc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { University, GlobalConfig } from '../types';
import { UNIVERSITIES as STATIC_UNIVERSITIES, KRW_TO_VND as DEFAULT_KRW_TO_VND } from '../data';

const DEFAULT_CONFIG: GlobalConfig = {
  consultingFee: 39000000,
  thirdPartyFee: 11000000,
  applicationFee: 0,
  enrollmentFee: 2000000,
  koreanLanguageOptions: [0, 13000000, 14000000, 26000000, 27000000],
  dormVietnamPricePerMonth: 800000,
  dormKoreaOptions: [
    { label: 'Phòng 4 người (14M/6 tháng)', price: 14000000 },
    { label: 'Phòng 2 người (24M/6 tháng)', price: 24000000 },
  ],
  flightOptions: [5000000, 8000000, 10000000, 13000000, 17000000],
  defaultTuitionKrw: 120000000 / DEFAULT_KRW_TO_VND,
};

export { DEFAULT_CONFIG };

interface UseFirestoreReturn {
  universities: University[];
  globalConfig: GlobalConfig;
  setGlobalConfig: Dispatch<SetStateAction<GlobalConfig>>;
  user: User | null;
  isAdmin: boolean;
  defaultUniversityId: string;
}

export function useFirestore(): UseFirestoreReturn {
  const [universities, setUniversities] = useState<University[]>(STATIC_UNIVERSITIES);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u?.email === 'mktteamthtt@gmail.com');
    });
    return () => unsubscribe();
  }, []);

  // Firestore listener — Universities
  useEffect(() => {
    const q = query(collection(db, 'universities'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const unis: University[] = [];
        snapshot.forEach((d) => unis.push(d.data() as University));
        if (unis.length > 0) setUniversities(unis);
      },
      (error) => console.error('Firestore Error:', error)
    );
    return () => unsubscribe();
  }, []);

  // Firestore listener — Global Config
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'costs'),
      (docSnap) => {
        if (docSnap.exists()) setGlobalConfig(docSnap.data() as GlobalConfig);
      },
      (error) => console.error('Config Error:', error)
    );
    return () => unsubscribe();
  }, []);

  const defaultUniversityId = universities[0]?.id ?? '';

  return { universities, globalConfig, setGlobalConfig, user, isAdmin, defaultUniversityId };
}
