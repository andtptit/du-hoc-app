import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from './firebase';

import Header from './components/Header';
import Footer from './components/Footer';
import FormView from './components/FormView';
import DetailView from './components/DetailView';
import AdminLoginModal from './components/AdminLoginModal';
import AdminUniversitiesModal from './components/AdminUniversitiesModal';
import AdminRegistrationsModal from './components/AdminRegistrationsModal';
import AdminSettingsModal from './components/AdminSettingsModal';

import { useFirestore } from './hooks/useFirestore';
import { useCosts } from './hooks/useCosts';
import { FormData, Selections } from './types';
import { VISA_TYPES, TOPIK_LEVELS, UNIVERSITIES as STATIC_UNIVERSITIES } from './data';

const GOOGLE_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz_pY7mUfD6L_k-HqPz3M9c_9p3Jm9l7L8v4L-6z5_f/exec";

export default function App() {
  const [view, setView] = useState<'form' | 'detail'>('form');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    visaType: VISA_TYPES[2].id,
    topikLevel: TOPIK_LEVELS[0].id,
    universityId: STATIC_UNIVERSITIES[0].id,
    gpaThpt: '',
    gpaUni: '',
  });

  const [selections, setSelections] = useState<Selections>(() => ({
    koreanLangIdx: 1,
    dormVnMonths: 6,
    dormKrIdx: 0,
    flightIdx: 1,
    scholarshipPercent: 0,
  }));

  const [banners, setBanners] = useState<string[]>([
    "https://firebasestorage.googleapis.com/v0/b/du-hoc-test.appspot.com/o/banners%2Fkb-scholarship.png?alt=media"
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  
  // Admin States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUniversitiesOpen, setIsUniversitiesOpen] = useState(false);
  const [isRegistrationsOpen, setIsRegistrationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { universities, globalConfig, isAdmin, defaultUniversityId } = useFirestore();

  const selectedUni = useMemo(
    () => universities.find((u) => u.id === formData.universityId) || universities[0],
    [formData.universityId, universities]
  );

  const filteredUnis = useMemo(() => {
    return universities.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.nameKr.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [universities, searchQuery]);

  const costs = useCosts({
    selectedUni,
    visaTypeId: formData.visaType,
    topikLevelId: formData.topikLevel,
    globalConfig,
    selections,
    exchangeRate: globalConfig.exchangeRate,
  });

  // Sync universityId when universities are loaded
  useEffect(() => {
    if (defaultUniversityId && (!formData.universityId || formData.universityId === 'ajou')) {
      setFormData(prev => ({ ...prev, universityId: defaultUniversityId }));
    }
  }, [defaultUniversityId]);

  // Fetch Banners from Firestore
  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Firestore Banners Snapshot updated, size:", snapshot.size);
      if (!snapshot.empty) {
        const urls = snapshot.docs.map(doc => doc.data().url).filter(Boolean);
        console.log("Banners URLs fetched:", urls);
        if (urls.length > 0) setBanners(urls);
      } else {
        console.log("No banners found in collection 'banners'");
      }
    }, (err) => console.error("Banner fetch error:", err));
    return () => unsubscribe();
  }, []);

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'visaType') {
      setSelections(prev => ({
        ...prev,
        tuitionTerms: value === 'd4-1' ? 4 : 1
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Đã đăng xuất tài khoản Admin');
    } catch (error) {
      toast.error('Lỗi khi đăng xuất');
    }
  };

  const handleRegister = async () => {
    try {
      fetch(GOOGLE_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdAt: new Date().toISOString(),
          universityName: selectedUni?.name || '',
          costsTotal: costs.total
        }),
      }).catch(e => console.error("Sheets Error:", e));

      toast.success('Đăng ký nhận tư vấn thành công! TBT sẽ liên hệ bạn sớm.');
      setView('form');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col font-sans text-slate-900">
      <Header 
        isAdmin={isAdmin}
        onLoginClick={() => setIsLoginOpen(true)}
        onManageUnis={() => setIsUniversitiesOpen(true)}
        onManageRegs={() => setIsRegistrationsOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <AnimatePresence mode="wait">
            {view === 'form' ? (
              <FormView
                key="form"
                universities={universities}
                formData={formData}
                onFormChange={handleFormChange}
                onViewDetail={() => setView('detail')}
                banners={banners}
                selectedUni={selectedUni}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                showUniDropdown={showUniDropdown}
                onShowUniDropdown={setShowUniDropdown}
                filteredUnis={filteredUnis}
              />
            ) : (
              <DetailView
                key="detail"
                university={selectedUni}
                onBack={() => setView('form')}
                onApply={handleRegister}
                formData={formData}
                costs={costs}
                globalConfig={globalConfig}
                selections={selections}
                onSelectionsChange={setSelections}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      {/* Admin Modals */}
      <AnimatePresence>
        {isLoginOpen && (
          <AdminLoginModal onClose={() => setIsLoginOpen(false)} />
        )}
        
        {isUniversitiesOpen && (
          <AdminUniversitiesModal 
            universities={universities}
            onClose={() => setIsUniversitiesOpen(false)}
          />
        )}

        {isRegistrationsOpen && (
          <AdminRegistrationsModal
            onClose={() => setIsRegistrationsOpen(false)}
          />
        )}

        {isSettingsOpen && (
          <AdminSettingsModal
            config={globalConfig}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </AnimatePresence>

      <Toaster position="top-right" />
    </div>
  );
}
