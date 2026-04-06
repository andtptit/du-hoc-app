import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Home,
  Briefcase,
  User,
  Phone,
  Calculator
} from 'lucide-react';
import { University, FormData, CostBreakdown, GlobalConfig, Selections } from '../types';
import { formatVND } from '../utils/format';
import { VISA_TYPES, TOPIK_LEVELS } from '../data';
import { ParsedDormOption } from '../hooks/useCosts';
import CostBreakdownTable from './CostBreakdownTable';

interface DetailViewProps {
  university: University;
  onBack: () => void;
  onApply: () => void;
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  costs: Partial<CostBreakdown> & { total: number; parsedDormOptions?: ParsedDormOption[] };
  globalConfig: GlobalConfig;
  selections: Selections;
  onSelectionsChange: (s: Selections) => void;
}

export default function DetailView({
  university,
  onBack,
  onApply,
  formData,
  onFormChange,
  costs,
  globalConfig,
  selections,
  onSelectionsChange
}: DetailViewProps) {

  const TopVisaBadge = () => {
    const colors = {
      1: 'bg-emerald-500',
      2: 'bg-orange-500',
      3: 'bg-rose-500'
    };
    const color = colors[university.visaTop as keyof typeof colors] || 'bg-blue-600';

    return (
      <div className={`${color} inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-black text-[11px] uppercase tracking-wider shadow-lg`}>
        <Award className="w-3.5 h-3.5" />
        TOP {university.visaTop} VISA
      </div>
    );
  };

  const InfoCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="flex gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 h-fit">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">{value}</p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBack(); }}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0f3493] font-bold transition-all group"
        >
          <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#0f3493] group-hover:bg-blue-50 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Trở lại tìm kiếm
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: University Details (8/12) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Hero Banner Section */}
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl bg-white border border-slate-100">
            <div className="h-48 md:h-64 relative">
              <img src={university.image} alt="" className="w-full h-full object-cover brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 md:p-12 pb-24 md:pb-28">
                <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight -mt-4 drop-shadow-lg">
                  {university.nameKr}
                </h1>
              </div>
            </div>

            {/* Circular Logo & Name Bar */}
            <div className="px-8 md:px-12 py-8 flex flex-col md:flex-row items-center gap-8 bg-white relative">
              <div className="relative -mt-24 md:-mt-32">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-3 shadow-2xl border-4 border-white flex items-center justify-center overflow-hidden">
                  <img src={university.logoUrl || university.image} alt="" className="w-full h-full object-contain rounded-full" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <TopVisaBadge />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left pt-4 md:pt-0">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">{university.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" />
                    RANK {university.rank}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Hàn Quốc
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={MapPin} label="Địa chỉ" value={university.address} />
            <InfoCard icon={BookOpen} label="Chuyên ngành nổi bật" value={university.majors} />
            <InfoCard icon={CheckCircle2} label="Điều kiện tuyển sinh" value={university.admissionRequirements} />
            <InfoCard icon={GraduationCap} label="Học thuật & Xếp hạng" value={university.rank} />

            {/* Việc làm thêm (Part-time) */}
            <div className="md:col-span-2 bg-white px-8 py-6 rounded-[32px] border border-slate-200 shadow-none space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase text-[13px] tracking-widest">
                <Briefcase className="w-4 h-4" /> CƠ HỘI VIỆC LÀM
              </div>
              <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line font-medium pb-2">
                {university.jobOpportunities || "Chưa có thông tin cập nhật về việc làm thêm."}
              </p>
            </div>
          </div>


          {/* Fee Calculation Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Calculator className="w-6 h-6 text-[#0f3493]" />
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dự toán chi phí & Lộ trình</h3>
            </div>

            <CostBreakdownTable
              costs={costs}
              globalConfig={globalConfig}
              selections={selections}
              onSelectionsChange={(newS) => {
                onSelectionsChange(newS);
              }}
              university={university}
              visaId={formData.visaType}
            />
          </div>

        </div>

        {/* Right Column: Student Info & Summary (4/12) */}
        <div className="lg:col-span-4 space-y-6">

          <div className="sticky top-28 space-y-6">
            {/* Student Profile Card */}
            <div className="bg-[#0f3493] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              {/* Background Decor */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight leading-none">Thông tin học viên</h3>
                    <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.2em] mt-1">Dữ liệu từ biểu mẫu</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest pl-1">Họ và tên</p>
                    <input
                      type="text"
                      className="w-full bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-xl px-4 py-2 text-base font-bold outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all font-mono"
                      value={formData.name}
                      onChange={(e) => onFormChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest pl-1">Số điện thoại</p>
                    <input
                      type="tel"
                      className="w-full bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-xl px-4 py-2 text-base font-bold outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all font-mono"
                      value={formData.phone}
                      onChange={(e) => onFormChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest pl-1">GPA THPT</p>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-xl px-4 py-2 text-base font-bold outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all font-mono"
                        value={formData.gpaThpt}
                        onChange={(e) => onFormChange('gpaThpt', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest pl-1">GPA ĐH</p>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-xl px-4 py-2 text-base font-bold outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all font-mono"
                        value={formData.gpaUni}
                        onChange={(e) => onFormChange('gpaUni', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest pl-1">Hệ Visa</p>
                      <select
                        className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-white/50 focus:bg-white focus:text-[#0f3493] transition-all appearance-none cursor-pointer"
                        value={formData.visaType}
                        onChange={(e) => onFormChange('visaType', e.target.value)}
                      >
                        {VISA_TYPES.map(v => (
                          <option key={v.id} value={v.id} className="text-slate-800">{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest pl-1">TOPIK</p>
                      <select
                        className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-white/50 focus:bg-white focus:text-[#0f3493] transition-all appearance-none cursor-pointer"
                        value={formData.topikLevel}
                        onChange={(e) => onFormChange('topikLevel', e.target.value)}
                      >
                        {TOPIK_LEVELS.map(t => (
                          <option key={t.id} value={t.id} className="text-slate-800">{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Cost Banner */}
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl space-y-6">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">TỔNG CHI PHÍ DỰ TÍNH (TRỌN GÓI)</p>
                <p className="text-4xl font-black text-[#0f3493] tracking-tighter text-center">
                  {formatVND(costs.total)}
                </p>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Chi phí chưa bao gồm phí chứng minh tài chính</span>

                </div>

              </div>

              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onApply(); }}
                className="w-full bg-[#ef4444] text-white py-5 rounded-full font-black text-lg uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.98]"
              >
                Đăng ký ngay
              </button>
              <p className="text-[10px] text-slate-400 text-center font-medium italic">
                * Chi phí có thể thay đổi tùy theo tỷ giá và chính sách trường
              </p>
            </div>

            {/* Sidebar Footer Link */}
            <div className="bg-slate-50 p-6 rounded-[32px] border border-dashed border-slate-200 flex flex-col items-center gap-4">
              <img src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0255597007.firebasestorage.app/o/Logo%20TBT%20ko%20slogan-ngang.png?alt=media&token=f4175f0f-c25f-4b6b-a68e-b8e22a8ae1a2" className="h-4 grayscale opacity-40" alt="" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Hệ thống giáo dục TBT - Đồng hành cùng ước mơ của bạn</p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
