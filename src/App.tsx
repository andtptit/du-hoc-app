/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { setDoc, doc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { db, auth } from './firebase';
import { UNIVERSITIES as STATIC_UNIVERSITIES, VISA_TYPES, TOPIK_LEVELS, KRW_TO_VND as DEFAULT_KRW_TO_VND } from './data';
import { FormData, Selections } from './types';
import { SELECTIONS_KEY } from './utils/format';
import { useFirestore, DEFAULT_CONFIG } from './hooks/useFirestore';
import { useCosts } from './hooks/useCosts';
import Header from './components/Header';
import Footer from './components/Footer';
import FormView from './components/FormView';
import DetailView from './components/DetailView';
import AdminSettingsModal from './components/AdminSettingsModal';

export default function App() {
  const [view, setView] = useState<'form' | 'detail'>('form');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_KRW_TO_VND);
  const [usdRate, setUsdRate] = useState(25000); // Tỷ giá VND/USD
  const [searchQuery, setSearchQuery] = useState('');
  const [showUniDropdown, setShowUniDropdown] = useState(false);

  const { universities, globalConfig, setGlobalConfig, user, isAdmin, defaultUniversityId } =
    useFirestore();

  const [selections, setSelections] = useState<Selections>(() => {
    const saved = localStorage.getItem(SELECTIONS_KEY);
    return saved
      ? JSON.parse(saved)
      : { koreanLangIdx: 0, dormVnMonths: 6, dormKrIdx: 0, flightIdx: 1, scholarshipPercent: 0 };
  });

  useEffect(() => {
    localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections));
  }, [selections]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    visaType: VISA_TYPES[2].id,
    topikLevel: TOPIK_LEVELS[0].id,
    universityId: STATIC_UNIVERSITIES[0].id,
    gpa: '7.0',
  });

  // Sync universityId khi danh sách trường load xong từ Firestore
  useEffect(() => {
    if (defaultUniversityId && !universities.find((u) => u.id === formData.universityId)) {
      setFormData((prev) => ({ ...prev, universityId: defaultUniversityId }));
    }
  }, [defaultUniversityId, universities]);

  const selectedUni = useMemo(
    () => universities.find((u) => u.id === formData.universityId) || universities[0],
    [formData.universityId, universities]
  );

  const costs = useCosts({
    selectedUni,
    visaTypeId: formData.visaType,
    topikLevelId: formData.topikLevel,
    exchangeRate,
    globalConfig,
    selections,
  });

  const handleFormChange = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleUniSelect = (id: string) => {
    setFormData((prev) => ({ ...prev, universityId: id }));
    setShowUniDropdown(false);
    setSearchQuery('');
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const handleSeedData = async () => {
    if (!isAdmin) return;
    setIsSeeding(true);
    try {
      for (const uni of STATIC_UNIVERSITIES) {
        await setDoc(doc(db, 'universities', uni.id), uni);
      }
      await setDoc(doc(db, 'settings', 'costs'), DEFAULT_CONFIG);
      alert('Đã cập nhật dữ liệu lên Database thành công!');
    } catch (error) {
      console.error('Seed Error:', error);
      alert('Lỗi khi cập nhật dữ liệu!');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveSettings = async (newConfig: typeof globalConfig) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'settings', 'costs'), newConfig);
      setGlobalConfig(newConfig);
      setIsSettingsOpen(false);
      alert('Đã lưu cài đặt chi phí thành công!');
    } catch (error) {
      console.error('Save Settings Error:', error);
      alert('Lỗi khi lưu cài đặt!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Header
        selectedUniName={selectedUni?.name || ''}
        user={user}
        isAdmin={isAdmin}
        onLogin={handleLogin}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
      />

      <main className="max-w-4xl mx-auto px-4 -mt-8 pb-20">
        <AnimatePresence mode="wait">
          {view === 'form' ? (
            <FormView
              formData={formData}
              onFormChange={handleFormChange}
              exchangeRate={exchangeRate}
              onExchangeRateChange={setExchangeRate}
              selectedUni={selectedUni}
              universities={universities}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              showUniDropdown={showUniDropdown}
              onShowUniDropdown={setShowUniDropdown}
              onUniSelect={handleUniSelect}
              costsTotal={costs.total}
              onViewDetail={() => setView('detail')}
              globalConfig={globalConfig}
              selections={selections}
            />
          ) : (
            <DetailView
              selectedUni={selectedUni}
              costs={costs}
              globalConfig={globalConfig}
              selections={selections}
              onSelectionsChange={setSelections}
              exchangeRate={exchangeRate}
              usdRate={usdRate}
              onUsdRateChange={setUsdRate}
              onBack={() => setView('form')}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSettingsOpen && (
          <AdminSettingsModal
            globalConfig={globalConfig}
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
