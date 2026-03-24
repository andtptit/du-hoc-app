import React from 'react';
import { University } from '../types';

interface Props {
  universities: University[];
}

export default function TopVisaUniversities({ universities }: Props) {
  const top1 = universities.filter(u => u.visaTop === 1);
  const top2 = universities.filter(u => u.visaTop === 2);
  const top3 = universities.filter(u => u.visaTop === 3);

  const Column = ({ title, unis }: { title: string, unis: University[] }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-[#4a89ff] text-white font-bold py-4 text-center text-lg">{title}</div>
      <div className="flex bg-[#f8fbff] border-b border-slate-100 py-3 px-4 text-[11px] font-bold text-blue-800 uppercase tracking-widest">
        <div className="flex-1">Tên</div>
        <div className="w-24 text-right">Khu vực</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {unis.map(u => {
          return (
            <div key={u.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
              <div className="flex-1 min-w-0 pr-4">
                <p className="font-bold text-slate-700 text-sm truncate">{u.nameKr}</p>
                <p className="text-xs text-slate-500 truncate">{u.name}</p>
              </div>
              <div className="w-24 text-right text-xs text-slate-500 truncate">
                {u.region || ''}
              </div>
            </div>
          );
        })}
        {unis.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">Chưa có dữ liệu</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-12 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-[22px] font-black text-[#0f3493] uppercase tracking-wide">TRƯỜNG TOP VISA TẠI HÀN QUỐC</h2>
        <p className="text-slate-500 text-sm mt-1">Các trường đại học phổ biến được học viên Việt Nam lựa chọn</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-xl mx-auto">
        <Column title="TOP 1" unis={top1} />
        <Column title="TOP 2" unis={top2} />
        <Column title="TOP 3" unis={top3} />
      </div>
    </div>
  );
}
