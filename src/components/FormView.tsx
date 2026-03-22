/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Globe,
  Phone,
  Award,
  Calculator,
  Search,
  ArrowRight,
  Info,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { University, GlobalConfig, FormData, Selections } from '../types';
import { VISA_TYPES, TOPIK_LEVELS } from '../data';
import { formatVND } from '../utils/format';
import UniversityDropdown from './UniversityDropdown';
import { toast } from 'react-hot-toast';

interface FormViewProps {
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  exchangeRate: number;
  onExchangeRateChange: (rate: number) => void;
  selectedUni: University;
  universities: University[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showUniDropdown: boolean;
  onShowUniDropdown: (show: boolean) => void;
  onUniSelect: (id: string) => void;
  costsTotal: number;
  onViewDetail: () => void;
  globalConfig: GlobalConfig;
  selections: Selections;
}

export default function FormView({
  formData,
  onFormChange,
  exchangeRate,
  onExchangeRateChange,
  selectedUni,
  universities,
  searchQuery,
  onSearchChange,
  showUniDropdown,
  onShowUniDropdown,
  onUniSelect,
  costsTotal,
  onViewDetail,
}: FormViewProps) {
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});

  const handleViewDetail = () => {
    const newErrors = {
      name: !formData.name.trim(),
      phone: !formData.phone.trim(),
    };
    setErrors(newErrors);
    
    if (newErrors.name || newErrors.phone) {
      toast.error('Vui lòng điền đủ Tên & Số điện thoại!');
      return;
    }
    
    onViewDetail();
  };

  const filteredUnis = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nameKr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100"
    >
      <div className="flex flex-col items-center mb-10">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Đăng Ký Tư Vấn Du Học</h2>
        <p className="text-slate-500 text-sm mt-1">
          Điền thông tin để nhận tư vấn chi tiết về chi phí và lộ trình du học
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Họ tên */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nguyễn Văn A"
            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50`}
            value={formData.name}
            onChange={(e) => {
              onFormChange('name', e.target.value);
              if (errors.name) setErrors({ ...errors, name: false });
            }}
          />
        </div>

        {/* Số điện thoại */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="+84 987 654 321 hoặc 0987654321"
            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50`}
            value={formData.phone}
            onChange={(e) => {
              onFormChange('phone', e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: false });
            }}
          />
        </div>

        {/* Hệ Visa */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Hệ visa / Chương trình
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
              value={formData.visaType}
              onChange={(e) => onFormChange('visaType', e.target.value)}
            >
              {VISA_TYPES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* TOPIK */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3 h-3" /> Trình độ TOPIK
          </label>
          <div className="relative">
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
              value={formData.topikLevel}
              onChange={(e) => onFormChange('topikLevel', e.target.value)}
            >
              {TOPIK_LEVELS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* GPA */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3 h-3" /> Điểm GPA (Hệ 10)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="7.0"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
            value={formData.gpa}
            onChange={(e) => onFormChange('gpa', e.target.value)}
          />
        </div>

        {/* Tỷ giá */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-3 h-3" /> Tỷ giá (1 KRW = ... VND)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50"
            value={exchangeRate}
            onChange={(e) => onExchangeRateChange(Number(e.target.value))}
          />
        </div>
      </div>

      {/* University Dropdown */}
      <UniversityDropdown
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showDropdown={showUniDropdown}
        onShowDropdown={onShowUniDropdown}
        filteredUnis={filteredUnis}
        onSelect={onUniSelect}
      />

      {/* Selected University Card */}
      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row md:items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 uppercase">
            {selectedUni.name} ({selectedUni.nameKr})
          </h3>
          <p className="text-xs text-slate-500">{selectedUni.rank}</p>
        </div>
        {Number(formData.gpa) <
          (formData.visaType === 'd4-1' ? selectedUni.minGpaD4 : selectedUni.minGpaD2) && (
          <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border border-amber-200">
            <Info className="w-4 h-4" />
            GPA của bạn thấp hơn yêu cầu (
            {formData.visaType === 'd4-1' ? selectedUni.minGpaD4 : selectedUni.minGpaD2})
          </div>
        )}
      </div>

      {/* Summary Cost Card */}
      <div className="bg-emerald-50/30 rounded-2xl p-8 border border-emerald-100/50 mb-8">
        <div className="flex items-center gap-2 text-emerald-700 font-bold mb-6">
          <Calculator className="w-5 h-5" />
          <span>Chi Phí Ước Tính Ban Đầu</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Chi phí hệ thống
            </span>
            <span className="font-medium text-slate-700">Học phí đại học</span>
          </div>
          <div className="h-px bg-emerald-200/50 w-full" />
          <div className="flex justify-between items-end">
            <div>
              <h4 className="font-bold text-slate-800">Tổng Chi Phí Ban Đầu:</h4>
              <p className="text-[10px] text-slate-400 italic mt-1">
                * Chưa bao gồm chi phí bổ sung (KTX, vé máy bay, v.v.). Xem chi tiết đầy đủ sau khi Tra Cứu.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-emerald-600 tracking-tight">
                {formatVND(costsTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleViewDetail}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
      >
        <Search className="w-5 h-5" />
        Tra Cứu Chi Tiết
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
