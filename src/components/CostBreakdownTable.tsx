import React from 'react';
import { Settings, Plus, Minus, Calculator } from 'lucide-react';
import { GlobalConfig, Selections, CostBreakdown, University } from '../types';
import { formatVND } from '../utils/format';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ParsedDormOption } from '../hooks/useCosts';
import { VISA_TYPES } from '../data';

interface CostBreakdownTableProps {
  costs: Partial<CostBreakdown> & { total: number; parsedDormOptions?: ParsedDormOption[] };
  globalConfig: GlobalConfig;
  selections: Selections;
  onSelectionsChange: (s: Selections) => void;
  university: University;
  visaId: string;
}

export default function CostBreakdownTable({
  costs,
  globalConfig,
  selections,
  onSelectionsChange,
  university,
  visaId,
}: CostBreakdownTableProps) {
  const update = (patch: Partial<Selections>) =>
    onSelectionsChange({ ...selections, ...patch });

  const selectedVisa = VISA_TYPES.find(v => v.id === visaId) || VISA_TYPES[2];
  const visaField = selectedVisa.field as 'calcTuitionD4' | 'calcTuitionD2_1' | 'calcTuitionD2_2' | 'calcTuitionD2_3';
  const baseTuitionKrw = university[visaField] || 0;

  const Row = ({ stt, label, subLabel, cost, options }: {
    stt: string,
    label: string,
    subLabel?: string,
    cost: number,
    options?: React.ReactNode
  }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const hasLongDescription = subLabel && subLabel.length > 40;

    return (
      <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors group">
        <td className="py-5 px-4 align-top">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 tabular-nums border border-slate-100 group-hover:bg-[#0f3493] group-hover:text-white group-hover:border-[#0f3493] transition-all italic">
            {stt}
          </div>
        </td>
        <td className="py-5 px-4">
          <p className="text-[15px] font-black text-slate-700 uppercase tracking-tight">{label}</p>
          {subLabel && (
            <div className="mt-0.5">
              <p className={`text-[11px] text-slate-400 font-bold ${!isExpanded && hasLongDescription ? 'line-clamp-1' : ''}`}>
                {subLabel}
              </p>
              {hasLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1 hover:text-blue-700"
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-3 h-3" /> Thu gọn</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> Xem thêm</>
                  )}
                </button>
              )}
            </div>
          )}
        </td>
        <td className="py-5 px-4 text-right align-top">
          <span className={`text-[15px] font-black ${cost < 0 ? 'text-emerald-600' : 'text-[#0f3493]'}`}>
            {cost < 0 ? '-' : ''}{formatVND(Math.abs(cost))}
          </span>
        </td>
        <td className="py-5 px-4 align-top">
          <div className="flex justify-end">
            {options || <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-wider">Cố định</span>}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0f3493]">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Chi tiết bóc tách chi phí</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Minh bạch - Rõ ràng - Tối ưu</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
          <Settings className="w-4 h-4 text-slate-300" />
          <span>Tùy chỉnh lộ trình</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-8 md:-mx-10">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="py-5 px-4 pl-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] w-24 italic">STT</th>
              <th className="py-5 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Hạng mục chi tiết</th>
              <th className="py-5 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] text-right">Chi phí (VND)</th>
              <th className="py-5 px-4 pr-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] text-right w-48">Tùy chọn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <Row
              stt="01"
              label="Học phí học tiếng Hàn tại trung tâm"

              cost={costs.koreanLangCost ?? 0}
              options={
                <select
                  className="text-[11px] font-bold bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0f3493] shadow-sm transition-all"
                  value={selections.koreanLangIdx}
                  onChange={(e) => update({ koreanLangIdx: Number(e.target.value) })}
                >
                  {globalConfig.koreanLanguageOptions.map((opt: any, i) => (
                    <option key={i} value={i}>
                      {typeof opt === 'object' ? opt.label : (
                        opt === 0 ? 'Tự học (0đ)' : (
                          i === 1 ? `Từ 0 đến TOPIK 2: ${formatVND(opt)}` : (
                            i === 2 ? `Từ 0 đến TOPIK 4: ${formatVND(opt)}` : `Gói ${i}: ${formatVND(opt)}`
                          )
                        )
                      )}
                    </option>
                  ))}
                </select>
              }
            />
            <Row stt="02" label="Phí tư vấn & Xử lý hồ sơ" subLabel="Trọn gói xây dựng hồ sơ" cost={costs.consultingFee ?? 0} />
            <Row stt="03" label="Phí thu hộ bên thứ 3" subLabel="Công chứng, Tem vàng, Visa, Khám SK..." cost={costs.thirdPartyFee ?? 0} />
            <Row
              stt="04"
              label="Phí xét duyệt hồ sơ"
              subLabel="Phí apply trường HQ"
              cost={costs.applicationFee ?? 0}
              options={
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200">
                  CỐ ĐỊNH
                </span>
              }
            />

            <Row
              stt="05"
              label="Phí nhập học"
              subLabel="Nộp thẳng cho trường"
              cost={costs.enrollmentFee ?? 2000000}
              options={
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200">
                  CỐ ĐỊNH
                </span>
              }
            />

            <Row
              stt="06"
              label="Ký túc xá tại VN"
              subLabel="800.000đ / tháng"
              cost={costs.dormVnCost ?? 0}
              options={
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => update({ dormVnMonths: Math.max(0, selections.dormVnMonths - 1) })}
                    className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-500" />
                  </button>
                  <span className="text-sm font-black w-4 text-center">{selections.dormVnMonths}</span>
                  <button
                    onClick={() => update({ dormVnMonths: Math.min(12, selections.dormVnMonths + 1) })}
                    className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              }
            />

            <Row
              stt="07"
              label="Học phí trường HQ"
              subLabel={`Dự kiến ${selections.tuitionTerms ?? (visaId === 'd4-1' ? 4 : 1)} kỳ, mỗi kỳ ${baseTuitionKrw.toLocaleString('vi-VN')} KRW`}
              cost={costs.tuitionVnd ?? 0}
              options={
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const currentTerms = selections.tuitionTerms ?? (visaId === 'd4-1' ? 4 : 1);
                      update({ tuitionTerms: Math.max(1, currentTerms - 1) });
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-500" />
                  </button>
                  <span className="text-sm font-black w-4 text-center">
                    {selections.tuitionTerms ?? (visaId === 'd4-1' ? 4 : 1)}
                  </span>
                  <button
                    onClick={() => {
                      const currentTerms = selections.tuitionTerms ?? (visaId === 'd4-1' ? 4 : 1);
                      update({ tuitionTerms: Math.min(8, currentTerms + 1) });
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              }
            />

            <Row
              stt="08"
              label="Học bổng"
              subLabel={university.scholarship || "Chính sách giảm trừ của trường"}
              cost={-(costs.scholarshipAmount ?? 0)}
              options={
                <select
                  className="text-[11px] font-bold bg-white border border-emerald-200 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all text-emerald-600"
                  value={selections.scholarshipPercent}
                  onChange={(e) => update({ scholarshipPercent: Number(e.target.value) })}
                >
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
                    <option key={p} value={p}>{p}% Học bổng</option>
                  ))}
                </select>
              }
            />

            <Row
              stt="09"
              label="KTX / Tiền nhà HQ"
              subLabel="Dự kiến 6 tháng đầu"
              cost={costs.dormKrCost ?? 0}
              options={
                <select
                  className="text-[11px] font-bold bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0f3493] shadow-sm transition-all"
                  value={selections.dormKrIdx}
                  onChange={(e) => update({ dormKrIdx: Number(e.target.value) })}
                >
                  {(costs.parsedDormOptions || globalConfig.dormKoreaOptions).map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
              }
            />

            <Row
              stt="10"
              label="Vé máy bay"
              subLabel="Một chiều (Bao gồm ký gửi)"
              cost={costs.flightCost ?? 0}
              options={
                <select
                  className="text-[11px] font-bold bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0f3493] shadow-sm transition-all"
                  value={selections.flightIdx}
                  onChange={(e) => update({ flightIdx: Number(e.target.value) })}
                >
                  {globalConfig.flightOptions.map((opt, i) => (
                    <option key={i} value={i}>Gói {i + 1}: {formatVND(opt)}</option>
                  ))}
                </select>
              }
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
