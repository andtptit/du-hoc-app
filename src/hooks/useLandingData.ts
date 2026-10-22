import { useEffect, useState } from 'react';
import type { GlobalConfig, University } from '../types';
import { DEFAULT_CONFIG } from '../defaultConfig';

export function useLandingData(enabled = true) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    setSchoolsLoading(true);
    setSchoolsError(false);
    let cancelled = false;
    let unsubscribeUniversities: (() => void) | undefined;
    let unsubscribeConfig: (() => void) | undefined;

    // The hero can render before downloading Firestore and the school dataset.
    Promise.all([import('firebase/firestore'), import('../firebasePublic')]).then(([firestore, { db }]) => {
      if (cancelled) return;
      unsubscribeUniversities = firestore.onSnapshot(firestore.collection(db, 'universities'), (snapshot) => {
        const schools = snapshot.docs.map((entry) => entry.data() as University);
        setUniversities(schools);
        setSchoolsLoading(false);
      }, (error) => {
        setSchoolsLoading(false);
        setSchoolsError(true);
        console.error('University fetch error:', error);
      });
      unsubscribeConfig = firestore.onSnapshot(firestore.doc(db, 'settings', 'costs'), (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        const merged = { ...DEFAULT_CONFIG, ...data } as GlobalConfig;
        if (!merged.consultingOptions && data.consultingFee) merged.consultingOptions = [data.consultingFee];
        if (merged.consultingOptions && !merged.consultingOptions.includes(60000000)) {
          merged.consultingOptions = [...merged.consultingOptions, 60000000].sort((a, b) => a - b);
        }
        setGlobalConfig(merged);
      }, (error) => console.error('Cost config fetch error:', error));
    }).catch((error) => {
      setSchoolsLoading(false);
      setSchoolsError(true);
      console.error('Landing data load error:', error);
    });

    return () => {
      cancelled = true;
      unsubscribeUniversities?.();
      unsubscribeConfig?.();
    };
  }, [enabled, retryCount]);

  return { universities, globalConfig, schoolsLoading, schoolsError, retrySchools: () => setRetryCount((count) => count + 1) };
}
