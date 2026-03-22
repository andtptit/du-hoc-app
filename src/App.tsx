/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { setDoc, doc, addDoc, collection } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { db, auth } from './firebase';
import { UNIVERSITIES as STATIC_UNIVERSITIES, VISA_TYPES, TOPIK_LEVELS, KRW_TO_VND as DEFAULT_KRW_TO_VND } from './data';
import { FormData, Selections } from './types';
import { SELECTIONS_KEY } from './utils/format';
import { useFirestore, DEFAULT_CONFIG } from './hooks/useFirestore';
import { useCosts } from './hooks/useCosts';
import { Toaster, toast } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import FormView from './components/FormView';
import DetailView from './components/DetailView';
import AdminSettingsModal from './components/AdminSettingsModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminRegistrationsModal from './components/AdminRegistrationsModal';
import AdminUniversitiesModal from './components/AdminUniversitiesModal';

// Kéo thả đường Link Webhook Google Apps Script của bạn vào dấu nháy kép dưới đây:
const GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxDhzLK58bAt9Xlqa7BtiTYiP9WAKRq7zjl3QXT1SVMZ1WFrwv5kuZ42Y6mJZjBTeXH/exec';

export default function App() {
  const [view, setView] = useState<'form' | 'detail'>('form');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegistrationsOpen, setIsRegistrationsOpen] = useState(false);
  const [isUniversitiesOpen, setIsUniversitiesOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
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

  const handleLogin = () => {
    setIsLoginOpen(true);
  };

  const handleSaveSettings = async (newConfig: typeof globalConfig) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'settings', 'costs'), newConfig);
      setGlobalConfig(newConfig);
      setIsSettingsOpen(false);
      toast.success('Đã lưu cài đặt chi phí thành công!');
    } catch (error) {
      console.error('Save Settings Error:', error);
      toast.error('Lỗi khi lưu cài đặt!');
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Vui lòng quay lại nhập đủ Tên & SĐT để đăng ký!');
      return;
    }
    setIsRegistering(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        name: formData.name,
        phone: formData.phone,
        visaType: formData.visaType,
        topikLevel: formData.topikLevel,
        universityId: formData.universityId,
        gpa: formData.gpa,
        universityName: selectedUni?.name || '',
        costsTotal: costs.total,
        selections,
        createdAt: new Date().toISOString(),
      });

      // RẼ NHÁNH: BẮN DỮ LIỆU SANG GOOGLE SHEETS
      if (GOOGLE_WEBHOOK_URL) {
        try {
          // Firebase đã thành công, chạy ngầm việc bắn sang Google Sheets
          fetch(GOOGLE_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', // Bỏ qua chặn CORS của trình duyệt khi bắn chéo sang Google
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              createdAt: new Date().toLocaleString('vi-VN'),
              name: formData.name,
              phone: formData.phone,
              universityName: selectedUni?.name || '',
              visaType: formData.visaType,
              topikLevel: formData.topikLevel,
              gpa: formData.gpa,
              costsTotal: costs.total
            }),
          }).catch(e => console.error("Google Sheets Webhook Error:", e));
        } catch (e) {
          console.error("Fetch Execution Error:", e);
        }
      }

      toast.success('Thành công! Chúng tôi sẽ liên hệ trong ít phút.', { duration: 4000 });
      setView('form'); // Quay về form trống
    } catch (err) {
      console.error('Lỗi khi đăng ký:', err);
      toast.error('Lỗi gửi đi, vui lòng thử lại sau!');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '12px', background: '#333', color: '#fff', fontWeight: 500 }
        }}
      />
      <Header
        selectedUniName={selectedUni?.name || ''}
        user={user}
        isAdmin={isAdmin}
        onLogin={handleLogin}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRegistrations={() => setIsRegistrationsOpen(true)}
        onOpenUniversities={() => setIsUniversitiesOpen(true)}
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
              onRegister={handleRegister}
              isRegistering={isRegistering}
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
        {isLoginOpen && (
          <AdminLoginModal onClose={() => setIsLoginOpen(false)} />
        )}
        {isRegistrationsOpen && isAdmin && (
          <AdminRegistrationsModal onClose={() => setIsRegistrationsOpen(false)} />
        )}
        {isUniversitiesOpen && isAdmin && (
          <AdminUniversitiesModal universities={universities} onClose={() => setIsUniversitiesOpen(false)} />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
