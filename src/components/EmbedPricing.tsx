import React, { useState, useMemo } from 'react';
import 'iframe-resizer/js/iframeResizer.contentWindow';
import { useParams } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import { useCosts } from '../hooks/useCosts';
import CostBreakdownTable from './CostBreakdownTable';
import { FormData, Selections } from '../types';
import { VISA_TYPES, TOPIK_LEVELS } from '../data';
import { formatVND } from '../utils/format';

export default function EmbedPricing() {
  const { universityId } = useParams<{ universityId: string }>();
  const { universities, globalConfig } = useFirestore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    visaType: VISA_TYPES[2].id, // Default to a standard one
    topikLevel: TOPIK_LEVELS[0].id,
    universityId: universityId || '',
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

  const selectedUni = useMemo(
    () => universities.find((u) => u.id === universityId),
    [universityId, universities]
  );

  const costs = useCosts({
    selectedUni,
    visaTypeId: formData.visaType,
    topikLevelId: formData.topikLevel,
    globalConfig,
    selections,
    exchangeRate: globalConfig.exchangeRate,
  });

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'visaType') {
      setSelections(prev => ({
        ...prev,
        tuitionTerms: value === 'd4-1' ? 4 : 1
      }));
    }
  };

  const handleCtaClick = () => {
    window.parent.postMessage({ type: 'TBT_EMBED_CTA_CLICK' }, '*');
  };

  if (universities.length === 0) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  if (!selectedUni) {
    return <div className="p-8 text-center text-red-500 font-bold">Không tìm thấy trường đại học với ID: {universityId}</div>;
  }

  return (
    <div className="bg-transparent font-sans text-slate-900">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Pricing Table (8/12) */}
          <div className="lg:col-span-8 space-y-6">
            <CostBreakdownTable
              costs={costs}
              globalConfig={globalConfig}
              selections={selections}
              onSelectionsChange={setSelections}
              university={selectedUni}
              visaId={formData.visaType}
            />
          </div>

          {/* Sidebar Info & Summary (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-8 space-y-6">
              
              {/* Parameters Card */}
              <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl space-y-4">
                 <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 mb-4">Tùy chỉnh lộ trình</h3>
                 <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Hệ Visa</p>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        value={formData.visaType}
                        onChange={(e) => handleFormChange('visaType', e.target.value)}
                      >
                        {VISA_TYPES.map(v => (
                          <option key={v.id} value={v.id}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">TOPIK</p>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        value={formData.topikLevel}
                        onChange={(e) => handleFormChange('topikLevel', e.target.value)}
                      >
                        {TOPIK_LEVELS.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
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
                  onClick={handleCtaClick}
                  className="w-full bg-[#ef4444] text-white py-5 rounded-full font-black text-lg uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.98]"
                >
                  Đăng ký ngay
                </button>
                <p className="text-[10px] text-slate-400 text-center font-medium italic">
                  * Chi phí có thể thay đổi tùy theo tỷ giá và chính sách trường
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

