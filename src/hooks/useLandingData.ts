import { useEffect, useState } from 'react';
import type { CostUniversity, GlobalConfig } from '../types';
import { DEFAULT_CONFIG } from '../defaultConfig';
import snapshot from '../landing-snapshot.json';

const initialUniversities = snapshot.universities as CostUniversity[];
function normalizeConfig(data: Record<string, unknown> | null): GlobalConfig {
  const config = { ...DEFAULT_CONFIG, ...data } as GlobalConfig;
  config.koreanLanguageOptions = config.koreanLanguageOptions.map((option, index) =>
    typeof option === 'number' ? { label: index === 0 ? 'Tự học' : `Gói học tiếng ${index}`, price: option } : option
  );
  return config;
}

const initialConfig = normalizeConfig(snapshot.globalConfig);
const hasSnapshot = initialUniversities.length > 0;

export function useLandingData(enabled = true) {
  const [universities, setUniversities] = useState<CostUniversity[]>(initialUniversities);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(initialConfig);
  const [schoolsLoading, setSchoolsLoading] = useState(!hasSnapshot);
  const [schoolsError, setSchoolsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    setSchoolsLoading(!hasSnapshot);
    setSchoolsError(false);
    let cancelled = false;
    let unsubscribeUniversities: (() => void) | undefined;
    let unsubscribeConfig: (() => void) | undefined;

    // The hero can render before downloading Firestore and the school dataset.
    Promise.all([import('firebase/firestore'), import('../firebasePublic')]).then(([firestore, { db }]) => {
      if (cancelled) return;
      unsubscribeUniversities = firestore.onSnapshot(firestore.collection(db, 'universities'), (snapshot) => {
        const schools = snapshot.docs.map((entry) => entry.data() as CostUniversity);
        if (schools.length > 0) setUniversities(schools);
        setSchoolsLoading(false);
      }, (error) => {
        setSchoolsLoading(false);
        setSchoolsError(!hasSnapshot);
        console.error('University fetch error:', error);
      });
      unsubscribeConfig = firestore.onSnapshot(firestore.doc(db, 'settings', 'costs'), (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        const merged = normalizeConfig(data);
        if (!merged.consultingOptions && data.consultingFee) merged.consultingOptions = [data.consultingFee];
        if (merged.consultingOptions && !merged.consultingOptions.includes(60000000)) {
          merged.consultingOptions = [...merged.consultingOptions, 60000000].sort((a, b) => a - b);
        }
        setGlobalConfig(merged);
      }, (error) => console.error('Cost config fetch error:', error));
    }).catch((error) => {
      setSchoolsLoading(false);
      setSchoolsError(!hasSnapshot);
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
