/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowLeft,
  Globe,
  Award,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { University, GlobalConfig, Selections, CostBreakdown } from '../types';
import { formatVND, formatUSD, formatKRW } from '../utils/format';
import CostBreakdownTable from './CostBreakdownTable';

interface DetailViewProps {
  selectedUni: University;
  costs: Partial<CostBreakdown> & { total: number };
  globalConfig: GlobalConfig;
  selections: Selections;
  onSelectionsChange: (s: Selections) => void;
  exchangeRate: number;     // KRW → VND
  usdRate: number;          // VND → USD
  onUsdRateChange: (v: number) => void;
  onBack: () => void;
  onRegister: () => void;
  isRegistering: boolean;
}

export default function DetailView({
  selectedUni,
  costs,
  globalConfig,
  selections,
  onSelectionsChange,
  exchangeRate,
  usdRate,
  onUsdRateChange,
  onBack,
  onRegister,
  isRegistering,
}: DetailViewProps) {

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      {/* Nút quay lại Nổi bật - Sticky */}
      <div className="sticky top-4 z-50 mb-4 flex justify-between items-center backdrop-blur-md bg-white/80 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100/50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại để sửa thông tin
        </button>
      </div>

      {/* Hero ảnh trường */}
      <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={selectedUni.image}
          alt={selectedUni.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">CN</span>
            <Globe className="w-3 h-3" />
            <span>Hàn Quốc</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {selectedUni.name} ({selectedUni.nameKr})
          </h2>
          <p className="text-white/80 text-sm">{selectedUni.rank}</p>
        </div>
      </div>

      {/* Thông tin chung */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Thông tin chung</h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <Award className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-slate-700">Xếp hạng &amp; Vị trí:</p>
              <p className="text-sm text-slate-500">{selectedUni.rank}</p>
              <p className="text-xs text-slate-400 mt-1">{selectedUni.address}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <BookOpen className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-slate-700">Chuyên ngành tiêu biểu:</p>
              <p className="text-sm text-slate-500 mt-1">{selectedUni.majors}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-slate-700">Điều kiện tuyển sinh:</p>
              <p className="text-sm text-slate-500 mt-1">{selectedUni.admissionRequirements}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Chính sách học bổng
              </p>
              <p className="text-xs text-slate-500 leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100">
                {selectedUni.scholarship}
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" /> Cơ hội việc làm
              </p>
              <p className="text-xs text-slate-500 leading-relaxed bg-blue-50 p-3 rounded-xl border border-blue-100">
                {selectedUni.jobOpportunities}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm font-bold text-slate-700 mb-2">Thông tin Ký túc xá</p>
            <p className="text-xs text-slate-500 leading-relaxed">{selectedUni.dormitory}</p>
          </div>
        </div>
      </div>

      {/* Bảng bóc giá */}
      <CostBreakdownTable
        costs={costs}
        globalConfig={globalConfig}
        selections={selections}
        onSelectionsChange={onSelectionsChange}
      />

      {/* Total Card */}
      <div className="bg-blue-600 rounded-3xl p-8 border border-blue-500 shadow-2xl shadow-blue-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h4 className="text-xl font-bold text-white">TỔNG CHI PHÍ TRỌN GÓI:</h4>
            <div className="flex gap-3 text-xs text-blue-100 mt-2">
              <span className="bg-white/10 px-2 py-0.5 rounded">
                ~{formatUSD(costs.total, usdRate)}
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded">
                ~{formatKRW(costs.total, exchangeRate)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
              {formatVND(costs.total)}
            </span>
            <p className="text-[10px] text-blue-100 mt-2 italic opacity-80">
              * Chi phí thực tế có thể thay đổi tùy thời điểm
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onRegister}
        disabled={isRegistering}
        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
      >
        {isRegistering ? (
          <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        ) : (
          <>
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-lg">Xác nhận gửi thông tin Đăng ký</span>
          </>
        )}
      </button>
    </motion.div>
  );
}
