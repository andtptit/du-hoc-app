/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { GlobalConfig } from '../types';

interface AdminSettingsModalProps {
  globalConfig: GlobalConfig;
  onSave: (config: GlobalConfig) => void;
  onClose: () => void;
}

export default function AdminSettingsModal({
  globalConfig,
  onSave,
  onClose,
}: AdminSettingsModalProps) {
  // Fix bug: dùng controlled state thay vì defaultValue + onBlur
  const [localConfig, setLocalConfig] = useState<GlobalConfig>(globalConfig);

  // Sync nếu globalConfig thay đổi từ Firestore khi modal đang mở
  useEffect(() => {
    setLocalConfig(globalConfig);
  }, [globalConfig]);

  const update = (patch: Partial<GlobalConfig>) =>
    setLocalConfig((prev) => ({ ...prev, ...patch }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Cài đặt chi phí hệ thống
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Phí tư vấn (VND)</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={localConfig.consultingFee}
                onChange={(e) => update({ consultingFee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Phí thu hộ (VND)</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={localConfig.thirdPartyFee}
                onChange={(e) => update({ thirdPartyFee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Phí Apply (VND)</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={localConfig.applicationFee}
                onChange={(e) => update({ applicationFee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Phí nhập học (VND)</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={localConfig.enrollmentFee}
                onChange={(e) => update({ enrollmentFee: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">KTX VN / tháng (VND)</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={localConfig.dormVietnamPricePerMonth}
                onChange={(e) => update({ dormVietnamPricePerMonth: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Học phí mặc định (KRW)</label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
                value={localConfig.defaultTuitionKrw}
                onChange={(e) => update({ defaultTuitionKrw: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              onClick={() => onSave(localConfig)}
              className="px-6 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
