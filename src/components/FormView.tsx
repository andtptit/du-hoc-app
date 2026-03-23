import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Phone, Award, Globe, GraduationCap } from 'lucide-react';
import { University, FormData } from '../types';
import { VISA_TYPES, TOPIK_LEVELS } from '../data';
import UniversityDropdown from './UniversityDropdown';
import TopVisaUniversities from './TopVisaUniversities';
import HeroSlider from './HeroSlider';

interface FormViewProps {
  universities: University[];
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  onViewDetail: () => void;
  banners: string[];
  selectedUni: University;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showUniDropdown: boolean;
  onShowUniDropdown: (show: boolean) => void;
  filteredUnis: University[];
}

export default function FormView({
  universities,
  formData,
  onFormChange,
  onViewDetail,
  banners,
  selectedUni,
  searchQuery,
  onSearchChange,
  showUniDropdown,
  onShowUniDropdown,
  filteredUnis
}: FormViewProps) {
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});

  const validateAndProceed = () => {
    const newErrors = {
      name: !formData.name.trim(),
      phone: !formData.phone.trim(),
    };
    setErrors(newErrors);
    if (!newErrors.name && !newErrors.phone) {
      onViewDetail();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      {/* Hero Section */}
      <div className="-mx-4 sm:-mx-6 -mt-8 mb-4 overflow-hidden md:rounded-[40px] shadow-2xl">
        <HeroSlider bannerImages={banners} />
      </div>

      {/* Main Search Section */}
      <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-xl border border-slate-100 max-w-5xl mx-auto -mt-24 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-[#0f3493] uppercase tracking-tight mb-4">TRA CỨU THÔNG TIN DU HỌC</h2>
          <p className="text-slate-500 font-medium text-lg italic">Điền thông tin để tìm thông tin chi tiết về chi phí và lộ trình du học</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <User className="w-4 h-4 text-blue-500" /> Họ và tên *
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              className={`w-full px-6 py-4 rounded-2xl border ${errors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-100 bg-slate-50/50'} focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Phone className="w-4 h-4 text-blue-500" /> Số điện thoại *
            </label>
            <input
              type="tel"
              placeholder="0123456789"
              className={`w-full px-6 py-4 rounded-2xl border ${errors.phone ? 'border-red-500 bg-red-50/30' : 'border-slate-100 bg-slate-50/50'} focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
              value={formData.phone}
              onChange={(e) => onFormChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Globe className="w-4 h-4 text-blue-500" /> Hệ Visa / Chương trình
            </label>
            <select
              className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
              value={formData.visaType}
              onChange={(e) => onFormChange('visaType', e.target.value)}
            >
              {VISA_TYPES.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Award className="w-4 h-4 text-blue-500" /> Trình độ TOPIK
            </label>
            <select
              className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
              value={formData.topikLevel}
              onChange={(e) => onFormChange('topikLevel', e.target.value)}
            >
              {TOPIK_LEVELS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Award className="w-4 h-4 text-blue-500" /> GPA THPT (Hệ 10)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="7.0"
              className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              value={formData.gpaThpt}
              onChange={(e) => onFormChange('gpaThpt', e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Award className="w-4 h-4 text-blue-500" /> GPA Đại Học (Hệ 4)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="3.0"
              className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              value={formData.gpaUni}
              onChange={(e) => onFormChange('gpaUni', e.target.value)}
            />
          </div>
        </div>

        {/* University Selection */}
        <div className="space-y-4 mb-12">
            <UniversityDropdown
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              showDropdown={showUniDropdown}
              onShowDropdown={onShowUniDropdown}
              filteredUnis={filteredUnis}
              onSelect={(id) => onFormChange('universityId', id)}
            />
          
          {selectedUni && (
            <div className="flex items-center gap-6 p-6 bg-[#f8fbff] rounded-[30px] border border-blue-100/50 mt-4">
              <img src={selectedUni.image} alt="" className="w-20 h-20 object-cover bg-white rounded-2xl border border-blue-100 shadow-sm" />
              <div>
                <h4 className="font-black text-blue-900 text-xl uppercase leading-tight">{selectedUni.nameKr}</h4>
                <p className="text-[15px] text-blue-600 font-bold mt-1">{selectedUni.name}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full tracking-wider italic">RANK {selectedUni.rank}</span>
                    <span className={`px-3 py-1 ${selectedUni.visaTop === 1 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} text-[10px] font-black uppercase rounded-full tracking-wider`}>TOP {selectedUni.visaTop} VISA</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={validateAndProceed}
          className="w-full bg-[#0f3493] text-white py-6 rounded-full font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] uppercase tracking-widest"
        >
          {/* <Search className="w-6 h-6 stroke-[3px]" /> */}
          Tìm Kiếm / Tra Cứu
        </button>
      </div>

      <TopVisaUniversities universities={universities} />
    </motion.div>
  );
}
