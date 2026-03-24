import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Save, Globe, DollarSign } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GlobalConfig } from '../types';
import { toast } from 'react-hot-toast';

interface Props {
  config: GlobalConfig;
  onClose: () => void;
}

export default function AdminSettingsModal({ config, onClose }: Props) {
  const [exchangeRate, setExchangeRate] = useState(config.exchangeRate || 18.5);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newConfig = {
        ...config,
        exchangeRate: Number(exchangeRate)
      };
      await setDoc(doc(db, 'settings', 'costs'), newConfig);
      toast.success('Cập nhật tỷ giá thành công!');
      onClose();
    } catch (error) {
      console.error('Save Config Error:', error);
      toast.error('Lỗi khi lưu cài đặt!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-2xl text-[#0f3493]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Cài Đặt Hệ Thống</h3>
            <p className="text-sm text-slate-500">Quản lý tỷ giá và các thông số tính toán</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-[#0f3493]">
              <Globe className="w-5 h-5" />
              <span className="font-bold">Tỷ giá ngoại tệ</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5 ml-1">
                  1 Won (KRW) = ? VNĐ
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-lg"
                    placeholder="18.5"
                    step="0.1"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400 italic">
                  * Tỷ giá này sẽ ảnh hưởng trực tiếp đến việc tính toán học phí trên toàn bộ hệ thống.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] px-6 py-3.5 bg-[#0f3493] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Lưu Cài Đặt
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
