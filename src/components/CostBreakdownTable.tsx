/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Plus, Minus } from 'lucide-react';
import { GlobalConfig, Selections, CostBreakdown } from '../types';
import { formatVND } from '../utils/format';

interface CostBreakdownTableProps {
  costs: Partial<CostBreakdown> & { total: number };
  globalConfig: GlobalConfig;
  selections: Selections;
  onSelectionsChange: (s: Selections) => void;
}

export default function CostBreakdownTable({
  costs,
  globalConfig,
  selections,
  onSelectionsChange,
}: CostBreakdownTableProps) {
  const update = (patch: Partial<Selections>) =>
    onSelectionsChange({ ...selections, ...patch });

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Bóc giá chi tiết (Breakdown)</h3>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <Settings className="w-3 h-3" />
          <span>Tùy chỉnh lộ trình</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-12">STT</th>
              <th className="py-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hạng mục</th>
              <th className="py-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Chi phí</th>
              <th className="py-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả / Tùy chọn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">

            {/* 01. Học tiếng Hàn */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">01</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">Học tiếng Hàn</p>
                <p className="text-[10px] text-slate-400">Từ 0 đến Topik 2/4</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-blue-600">{formatVND(costs.koreanLangCost ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <select
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                  value={selections.koreanLangIdx}
                  onChange={(e) => update({ koreanLangIdx: Number(e.target.value) })}
                >
                  {globalConfig.koreanLanguageOptions.map((opt, i) => (
                    <option key={i} value={i}>
                      {opt === 0 ? 'Tự học / Đã có bằng (0đ)' : `Gói ${i}: ${formatVND(opt)}`}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            {/* 02. Phí tư vấn */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">02</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">Phí tư vấn &amp; Xử lý hồ sơ</p>
                <p className="text-[10px] text-slate-400">Trọn gói xây dựng hồ sơ</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-slate-700">{formatVND(costs.consultingFee ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">Cố định</span>
              </td>
            </tr>

            {/* 03. Phí bên thứ 3 */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">03</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">Phí thu hộ bên thứ 3</p>
                <p className="text-[10px] text-slate-400">Công chứng, Tem vàng/tím, Visa, Khám SK, Ship, Đưa đón...</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-slate-700">{formatVND(costs.thirdPartyFee ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">Cố định</span>
              </td>
            </tr>

            {/* 04. Phí Apply */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">04</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">Phí Apply trường</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-slate-700">{formatVND(costs.applicationFee ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">Cố định</span>
              </td>
            </tr>

            {/* 05. Phí nhập học */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">05</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">Phí nhập học trường HQ</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-slate-700">{formatVND(costs.enrollmentFee ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">Cố định</span>
              </td>
            </tr>

            {/* 06. KTX VN */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">06</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">Ký túc xá tại VN</p>
                <p className="text-[10px] text-slate-400">800.000đ / tháng</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-blue-600">{formatVND(costs.dormVnCost ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => update({ dormVnMonths: Math.max(0, selections.dormVnMonths - 1) })}
                    className="p-1 bg-slate-100 rounded hover:bg-slate-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{selections.dormVnMonths}</span>
                  <button
                    onClick={() => update({ dormVnMonths: Math.min(12, selections.dormVnMonths + 1) })}
                    className="p-1 bg-slate-100 rounded hover:bg-slate-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-slate-400">tháng</span>
                </div>
              </td>
            </tr>

            {/* 07. Học phí HQ */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">07</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">Học phí trường HQ</p>
                <p className="text-[10px] text-slate-400">1 năm (4 kỳ)</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-slate-700">
                  {formatVND((costs.tuitionVnd ?? 0) + (costs.scholarshipAmount ?? 0))}
                </span>
              </td>
              <td className="py-4 px-2">
                <span className="text-[10px] text-slate-500 italic">Theo trường đã chọn</span>
              </td>
            </tr>

            {/* 08. Học bổng */}
            <tr className="bg-emerald-50/50">
              <td className="py-4 px-2 text-sm text-slate-400">08</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-emerald-700">Học bổng</p>
                <p className="text-[10px] text-emerald-600">Giảm trừ học phí</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-emerald-600">-{formatVND(costs.scholarshipAmount ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <select
                  className="text-xs bg-white border border-emerald-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-500"
                  value={selections.scholarshipPercent}
                  onChange={(e) => update({ scholarshipPercent: Number(e.target.value) })}
                >
                  {[0, 10, 15, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
                    <option key={p} value={p}>{p}%</option>
                  ))}
                </select>
              </td>
            </tr>

            {/* 09. KTX HQ */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">09</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">KTX / Tiền nhà HQ</p>
                <p className="text-[10px] text-slate-400">Dự kiến 6 tháng</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-blue-600">{formatVND(costs.dormKrCost ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <select
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                  value={selections.dormKrIdx}
                  onChange={(e) => update({ dormKrIdx: Number(e.target.value) })}
                >
                  {globalConfig.dormKoreaOptions.map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
              </td>
            </tr>

            {/* 10. Vé máy bay — số thứ tự sửa từ 11 thành 10 */}
            <tr>
              <td className="py-4 px-2 text-sm text-slate-400">10</td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-700">Vé máy bay 1 chiều</p>
                <p className="text-[10px] text-slate-400">Bao gồm 40kg ký gửi</p>
              </td>
              <td className="py-4 px-2 text-right">
                <span className="text-sm font-bold text-blue-600">{formatVND(costs.flightCost ?? 0)}</span>
              </td>
              <td className="py-4 px-2">
                <select
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                  value={selections.flightIdx}
                  onChange={(e) => update({ flightIdx: Number(e.target.value) })}
                >
                  {globalConfig.flightOptions.map((opt, i) => (
                    <option key={i} value={i}>{formatVND(opt)}</option>
                  ))}
                </select>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}
