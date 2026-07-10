import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { collection, onSnapshot, query, addDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from './firebase';

import Header from './components/Header';
import Footer from './components/Footer';
import FormView from './components/FormView';
import DetailView from './components/DetailView';
import ContactWidgets from './components/ContactWidgets';
import AdminLoginModal from './components/AdminLoginModal';
import AdminUniversitiesModal from './components/AdminUniversitiesModal';
import AdminRegistrationsModal from './components/AdminRegistrationsModal';
import AdminSettingsModal from './components/AdminSettingsModal';

import { useFirestore } from './hooks/useFirestore';
import { useCosts } from './hooks/useCosts';
import { FormData, Selections } from './types';
import { VISA_TYPES, TOPIK_LEVELS, UNIVERSITIES as STATIC_UNIVERSITIES } from './data';

const GOOGLE_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycby2KObaL-ev4jBf1TqZBWli2H4y1aitQyaCCnMG_KWTRD3B6KEttx5JHqng6dHn3i17/exec";

export default function App() {
  const [view, setView] = useState<'form' | 'detail'>('form');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    visaType: VISA_TYPES[2].id,
    topikLevel: TOPIK_LEVELS[0].id,
    universityId: '',
    gpaThpt: '',
    gpaUni: '',
  });

  const [selections, setSelections] = useState<Selections>(() => ({
    consultingIdx: 0,
    koreanLangIdx: 0,
    dormVnMonths: 0,
    dormKrIdx: 0,
    flightIdx: 0,
    scholarshipPercent: 0,
  }));

  const [banners, setBanners] = useState<string[]>([
    "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0255597007.firebasestorage.app/o/Herro%20banner.jpg?alt=media&token=4b17a97d-708a-4eef-88b9-1124e42c4dc1"
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showUniDropdown, setShowUniDropdown] = useState(false);

  // Admin States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUniversitiesOpen, setIsUniversitiesOpen] = useState(false);
  const [isRegistrationsOpen, setIsRegistrationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentRegistrationId, setCurrentRegistrationId] = useState<string | null>(null);

  const { universities, globalConfig, isAdmin, defaultUniversityId } = useFirestore();

  const selectedUni = useMemo(
    () => universities.find((u) => u.id === formData.universityId),
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


  // Fetch Banners from Firestore
  useEffect(() => {
    const q = query(collection(db, 'banners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const urls = snapshot.docs.map(doc => doc.data().url).filter(Boolean);
        setBanners(prev => {
          if (JSON.stringify(prev) === JSON.stringify(urls)) return prev;
          return urls;
        });
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

  const handleSearchAndSave = async () => {
    try {
      const regData = {
        ...formData,
        createdAt: new Date().toISOString(),
        universityName: selectedUni?.name || '',
        costsTotal: costs.total || 0,
        type: 'tra_cuu', // Lượt 1: Tra cứu
      };

      // Lưu Firestore và ghi nhận document ID
      const docRef = await addDoc(collection(db, 'registrations'), regData);
      setCurrentRegistrationId(docRef.id);

      // Payload gửi lên Google Sheets bổ sung các biến tương thích
      const sheetData = {
        ...regData,
        classification: 'Tra cứu',
        phanLoai: 'Tra cứu',
        typeLabel: 'Tra cứu'
      };

      // Gửi Webhook Sheets
      fetch(GOOGLE_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetData),
      }).catch(e => console.error("Sheets Error (Lượt 1):", e));

      // Bắn sự kiện Subscribe sang Meta Pixel cho Lượt 1: Tra cứu
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Subscribe', {
          content_name: sheetData.universityName,
          value: sheetData.costsTotal,
          currency: 'VND'
        });
      }
    } catch (error) {
      console.error("Lỗi lưu data lượt 1:", error);
    }

    setView('detail');
  };

  const handleRegister = async () => {
    const isPhoneValid = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(formData.phone.trim());
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    if (!isPhoneValid) {
      toast.error('Số điện thoại không đúng định dạng (VD: 0987654321)');
      return;
    }

    try {
      const regData = {
        ...formData,
        createdAt: new Date().toISOString(), // Cập nhật thời điểm đăng ký thực tế
        universityName: selectedUni?.name || '',
        costsTotal: costs.total || 0,
        type: 'dang_ky', // Lượt 2: Chuyển phân loại thành Đăng ký ngay
      };

      if (currentRegistrationId) {
        // Cập nhật lại bản ghi cũ thay vì tạo mới
        const docRef = doc(db, 'registrations', currentRegistrationId);
        await updateDoc(docRef, regData);
      } else {
        // Fallback tạo mới nếu không có ID lượt 1 trước đó
        const docRef = await addDoc(collection(db, 'registrations'), regData);
        setCurrentRegistrationId(docRef.id);
      }

      // Payload gửi lên Google Sheets bổ sung các biến tương thích
      const sheetData = {
        ...regData,
        classification: 'Đăng ký ngay',
        phanLoai: 'Đăng ký ngay',
        typeLabel: 'Đăng ký ngay'
      };

      // Gửi Webhook Sheets
      await fetch(GOOGLE_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetData),
      });

      // Bắn sự kiện Lead sang Meta Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: sheetData.universityName,
          value: sheetData.costsTotal,
          currency: 'VND'
        });
      }

      toast.success('Đăng ký nhận tư vấn thành công! Tiếng Hàn và Du Học Thầy Tư sẽ liên hệ bạn sớm.');
      setCurrentRegistrationId(null);
      setView('form');
    } catch (error) {
      console.error("Lỗi lưu data lượt 2:", error);
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
                universities={universities}
                formData={formData}
                onFormChange={handleFormChange}
                onViewDetail={handleSearchAndSave}
                banners={banners}
                selectedUni={selectedUni}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                showUniDropdown={showUniDropdown}
                onShowUniDropdown={setShowUniDropdown}
                filteredUnis={filteredUnis}
              />
            ) : selectedUni ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 md:mt-8"
              >
                <DetailView
                  university={selectedUni}
                  onBack={() => {
                    setCurrentRegistrationId(null);
                    setView('form');
                  }}
                  onApply={handleRegister}
                  formData={formData}
                  onFormChange={handleFormChange}
                  costs={costs}
                  globalConfig={globalConfig}
                  selections={selections}
                  onSelectionsChange={setSelections}
                />
              </motion.div>
            ) : null}
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

      <ContactWidgets />
      <Toaster position="top-right" />
    </div>
  );
}
