/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, doc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { University, GlobalConfig } from '../types';
import { UNIVERSITIES as STATIC_UNIVERSITIES } from '../data';
import { DEFAULT_CONFIG } from '../defaultConfig';

// Phải khớp với danh sách trong firestore.rules (hàm isAdmin)
const ADMIN_EMAILS = ['andtptit@gmail.com', 'mktteamthtt@gmail.com'];

export { DEFAULT_CONFIG } from '../defaultConfig';

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
  // Lưu ý: đây chỉ là check phía client để hiện/ẩn UI admin.
  // Quyền thật sự được kiểm soát bởi firestore.rules (danh sách email + email_verified).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u !== null && !!u.email && ADMIN_EMAILS.includes(u.email));
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
          // Đảm bảo luôn có tùy chọn 60 triệu trong danh sách cấu hình hồ sơ
          if (merged.consultingOptions && !merged.consultingOptions.includes(60000000)) {
            merged.consultingOptions = [...merged.consultingOptions, 60000000].sort((a, b) => a - b);
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
