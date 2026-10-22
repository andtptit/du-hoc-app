import { useEffect, useState } from 'react';
import type { GlobalConfig, University } from '../types';
import { DEFAULT_CONFIG } from '../defaultConfig';

export function useLandingData(enabled = true) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let unsubscribeUniversities: (() => void) | undefined;
    let unsubscribeConfig: (() => void) | undefined;

    // The hero can render before downloading Firestore and the school dataset.
    Promise.all([import('firebase/firestore'), import('../firebasePublic')]).then(([firestore, { db }]) => {
      if (cancelled) return;
      unsubscribeUniversities = firestore.onSnapshot(firestore.collection(db, 'universities'), (snapshot) => {
        const schools = snapshot.docs.map((entry) => entry.data() as University);
        if (schools.length) setUniversities(schools);
        setSchoolsLoading(false);
      }, (error) => {
        setSchoolsLoading(false);
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
      console.error('Landing data load error:', error);
    });

    return () => {
      cancelled = true;
      unsubscribeUniversities?.();
      unsubscribeConfig?.();
    };
  }, [enabled]);

  return { universities, globalConfig, schoolsLoading };
}
