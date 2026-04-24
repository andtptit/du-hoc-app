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
  consultingOptions: [39000000, 49000000],
  thirdPartyFee: 7000000,
  applicationFee: 0,
  enrollmentFee: 2000000,
  koreanLanguageOptions: [
    { label: 'Tự học (0đ)', price: 0 },
    { label: 'Từ 0 đến TOPIK 2: 13.000.000 đ', price: 13000000 },
    { label: 'Từ 0 đến TOPIK 4: 26.000.000 đ', price: 26000000 }
  ],
  dormVietnamPricePerMonth: 880000,
  dormKoreaOptions: [
    { label: 'Tự thuê / Không ở KTX (0đ)', price: 0 },
    { label: 'Phòng 4 người (14M/6 tháng)', price: 14000000 },
    { label: 'Phòng 2 người (24M/6 tháng)', price: 24000000 },
  ],
  flightOptions: [0, 5000000, 8000000, 10000000, 13000000, 17000000],
  defaultTuitionKrw: 120000000 / DEFAULT_KRW_TO_VND,
  exchangeRate: 18.5,
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
      setIsAdmin(u !== null); // Mọi user đăng nhập thành công là Admin (bởi vì Client ko cần thẻ Auth)
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
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Backward compatibility: Convert old consultingFee to consultingOptions
          const merged = { ...DEFAULT_CONFIG, ...data };
          if (!merged.consultingOptions && (data as any).consultingFee) {
            merged.consultingOptions = [(data as any).consultingFee];
          }
          setGlobalConfig(merged as GlobalConfig);
        }
      },
      (error) => console.error('Config Error:', error)
    );
    return () => unsubscribe();
  }, []);

  const defaultUniversityId = universities[0]?.id ?? '';

  return { universities, globalConfig, setGlobalConfig, user, isAdmin, defaultUniversityId };
}
