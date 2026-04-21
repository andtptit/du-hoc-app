import React from 'react';
import { Settings, Plus, Minus, Calculator } from 'lucide-react';
import { GlobalConfig, Selections, CostBreakdown, University } from '../types';
import { formatVND } from '../utils/format';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ParsedDormOption } from '../hooks/useCosts';
import { VISA_TYPES } from '../data';

interface CostBreakdownTableProps {
  costs: Partial<CostBreakdown> & {
    total: number;
    parsedDormOptions?: ParsedDormOption[];
    flightOptions?: number[];
  };
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
  const visaField = selectedVisa.field as 'calcTuitionD4' | 'calcTuitionD2_1' | 'calcTuitionD2_2' | 'calcTuitionD2_3' | 'calcTuitionD2_3_no_topik' | 'calcTuitionD2_6';
  const baseTuitionKrw = university[visaField] || 0;

  const Row = ({ stt, label, subLabel, cost, options, isHighlight = false, showNote = false }: {
    stt: string,
    label: string,
    subLabel?: string,
    cost: number,
    options?: React.ReactNode,
    isHighlight?: boolean,
    showNote?: boolean
  }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const hasLongDescription = (subLabel && subLabel.length > 40) || showNote;

    return (
      <tr className={`border-b border-blue-50/50 last:border-0 ${isHighlight ? 'bg-green-50/50' : 'bg-white'} transition-colors group`}>
        <td className="py-6 px-4 pl-10 align-top w-24">
          <span className={`text-[15px] font-medium ${isHighlight ? 'text-green-500' : 'text-blue-400'}`}>
            {stt}
          </span>
        </td>
        <td className="py-6 px-4">
          <p className={`text-[15px] font-bold ${isHighlight ? 'text-green-600' : 'text-slate-800'}`}>{label}</p>
          {subLabel && (
            <div className="mt-1">
              <div className={`${!isExpanded && hasLongDescription ? 'line-clamp-1' : ''}`}>
                {subLabel.split(';').map((part, idx, arr) => (
                  <p key={idx} className={`text-[12px] italic ${isHighlight ? 'text-green-600/70' : 'text-slate-400 font-medium'}`}>
                    {part.trim()}{idx < arr.length - 1 ? ';' : ''}
                  </p>
                ))}
              </div>
              {hasLongDescription && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className={`text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1 ${isHighlight ? 'text-green-600 hover:text-green-700' : 'text-blue-500 hover:text-blue-700'}`}
                >
                  {isExpanded ? (
                    <><ChevronUp className="w-3 h-3" /> Thu gọn</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> Xem thêm</>
                  )}
                </button>
              )}
              {showNote && isExpanded && (
                <p className="text-[10px] font-bold text-slate-400 italic mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  Note: Chi phí có thể thay đổi theo từng kỳ bay
                </p>
              )}
            </div>
          )}
        </td>
        <td className="py-6 px-4 text-right align-top">
          <span className={`text-[15px] font-bold ${isHighlight ? 'text-green-500' : 'text-blue-500'}`}>
            {cost === 0 ? formatVND(0) : `${cost < 0 ? '-' : ''}${formatVND(Math.abs(cost))}`}
          </span>
        </td>
        <td className="py-6 px-4 pr-10 align-top">
          <div className="flex justify-end">
            {options || <span className="text-[11px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-bold">Cố định</span>}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-10 border border-blue-100/60 shadow-[0_4px_24px_rgba(15,52,147,0.03)] overflow-hidden">
      <div className="mb-8 px-2">
        <h3 className="text-[20px] font-black text-[#0f3493] uppercase tracking-tight">Bảng giá bóc tách chi tiết</h3>
      </div>

      <div className="overflow-x-auto -mx-6 md:-mx-10">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-blue-50">
              <th className="pb-4 px-4 pl-10 text-[11px] font-bold text-blue-400 uppercase tracking-widest w-20">STT</th>
              <th className="pb-4 px-4 text-[11px] font-bold text-blue-400 uppercase tracking-widest">Hạng mục</th>
              <th className="pb-4 px-4 text-[11px] font-bold text-blue-400 uppercase tracking-widest text-right">Chi phí</th>
              <th className="pb-4 px-4 pr-10 text-[11px] font-bold text-blue-400 uppercase tracking-widest text-right w-52">Mô tả/Tùy chọn</th>
            </tr>
          </thead>
          <tbody className="">
            <Row
              stt="01"
              label="Học phí học tiếng Hàn tại trung tâm"

              cost={costs.koreanLangCost ?? 0}
              options={
                <select
                  value={selections.koreanLangIdx}
                  onChange={(e) => update({ koreanLangIdx: Number(e.target.value) })}
                  className="w-full md:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 outline-none hover:bg-slate-100 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat"
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
            <Row
              stt="02"
              label="Phí tư vấn & Xử lý hồ sơ"
              subLabel="Trọn gói xây dựng hồ sơ"
              cost={costs.consultingFee ?? 0}
              options={
                <select
                  value={selections.consultingIdx}
                  onChange={(e) => update({ consultingIdx: Number(e.target.value) })}
                  className="w-full md:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 outline-none hover:bg-slate-100 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat"
                >
                  {(globalConfig.consultingOptions || []).map((opt, i) => (
                    <option key={i} value={i}>{formatVND(opt)}</option>
                  ))}
                </select>
              }
            />
            <Row stt="03" label="Phí thu hộ bên thứ 3" subLabel="Phí công chứng, Tem vàng, Tem tím, Xin visa, Khám sức khoẻ, Phí ship hồ sơ qua các đơn vị tại Việt Nam, Phí ship hồ sơ sang trường, Phí đưa đón Hàn Quốc, Phí tìm ký túc xá" cost={costs.thirdPartyFee ?? 0} />
            <Row
              stt="04"
              label="Phí apply trường HQ"
              subLabel={university.applicationFee ? `${String(university.applicationFee)}` : 'Theo cấu hình chung'}
              cost={costs.applicationFee ?? 0}
              showNote={true}
              options={
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200">
                  CỐ ĐỊNH
                </span>
              }
            />

            <Row
              stt="05"
              label="Phí nhập học"
              subLabel={university.enrollmentFee ? `${String(university.enrollmentFee)}` : 'Theo cấu hình chung'}
              cost={costs.enrollmentFee ?? 2000000}
              showNote={true}
              options={
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200">
                  CỐ ĐỊNH
                </span>
              }
            />

            <Row
              stt="06"
              label="Ký túc xá tại Việt Nam"
              subLabel="880.000đ / tháng"
              cost={costs.dormVnCost ?? 0}
              options={
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); update({ dormVnMonths: Math.max(0, selections.dormVnMonths - 1) }); }}
                    className="w-6 h-6 flex items-center justify-center bg-blue-100/50 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-blue-600" />
                  </button>
                  <span className="text-[13px] font-medium w-4 text-center text-slate-700">{selections.dormVnMonths}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); update({ dormVnMonths: Math.min(12, selections.dormVnMonths + 1) }); }}
                    className="w-6 h-6 flex items-center justify-center bg-blue-100/50 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-blue-600" />
                  </button>
                  <span className="text-[12px] text-slate-500 ml-1 mt-0.5">tháng</span>
                </div>
              }
            />

            <Row
              stt="07"
              label="Học phí trường HQ"
              subLabel={visaId === 'd4-1'
                ? `${selectedVisa.label.replace(':', '')}: Một năm học phí gồm 4 kỳ, mỗi kỳ ${baseTuitionKrw.toLocaleString('vi-VN')} KRW`
                : `${selectedVisa.label.replace(':', '')}: Một năm học phí gồm 1 kỳ, mỗi kỳ ${baseTuitionKrw.toLocaleString('vi-VN')} KRW`}
              cost={costs.tuitionVnd ?? 0}
              showNote={true}
              options={
                <span className="text-[13px] font-bold bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg border border-blue-100">
                  {visaId === 'd4-1' ? 4 : 1} kỳ
                </span>
              }
            />

            <Row
              stt="08"
              label="Học bổng"
              subLabel={university.scholarship || "Chính sách giảm trừ của trường"}
              cost={-(costs.scholarshipAmount ?? 0)}
              isHighlight={true}
              options={
                <select
                  className="w-full md:w-auto px-4 py-2 bg-white border border-green-300 rounded-lg text-[13px] font-bold text-green-600 outline-none hover:bg-green-50 focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2316a34a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat"
                  value={selections.scholarshipPercent}
                  onChange={(e) => update({ scholarshipPercent: Number(e.target.value) })}
                >
                  {[0, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
                    <option key={p} value={p}>{p}%</option>
                  ))}
                </select>
              }
            />

            <Row
              stt="09"
              label="Ký túc xá/ Thuê nhà tại Hàn Quốc"
              subLabel="Chi phí có thể thay đổi theo từng kỳ"
              cost={costs.dormKrCost ?? 0}
              options={
                <select
                  className="w-full md:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 outline-none hover:bg-slate-100 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat"
                  value={selections.dormKrIdx}
                  onChange={(e) => update({ dormKrIdx: Number(e.target.value) })}
                >
                  {(costs.parsedDormOptions || globalConfig.dormKoreaOptions).map((opt, i) => (
                    <option key={i} value={i}>{typeof opt === 'string' ? opt : opt.label}</option>
                  ))}
                </select>
              }
            />

            <Row
              stt="10"
              label="Vé máy bay 1 chiều"
              subLabel="Bao gồm 40kg ký gửi"
              cost={costs.flightCost ?? 0}
              options={
                <select
                  className="w-full md:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-600 outline-none hover:bg-slate-100 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat"
                  value={selections.flightIdx}
                  onChange={(e) => update({ flightIdx: Number(e.target.value) })}
                >
                  {(costs.flightOptions || globalConfig.flightOptions).map((opt, i) => (
                    <option key={i} value={i}>{formatVND(opt)}</option>
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
