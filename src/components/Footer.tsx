/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <GraduationCap className="w-6 h-6 text-blue-500" />
            <span>Du Học Châu Á</span>
          </div>
          <p className="text-sm leading-relaxed">
            Cung cấp giải pháp tư vấn du học toàn diện, minh bạch chi phí và lộ trình phát triển bền vững cho sinh viên Việt Nam.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-bold uppercase text-xs tracking-widest">Liên kết nhanh</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Danh sách trường</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Cẩm nang du học</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Liên hệ</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-bold uppercase text-xs tracking-widest">Văn phòng</h4>
          <p className="text-sm">Tầng 15, Tòa nhà ABC, Quận 1, TP. Hồ Chí Minh</p>
          <div className="flex items-center gap-4 pt-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
              <Mail className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
        <p>© 2026 Du Học Châu Á. All rights reserved.</p>
      </div>
    </footer>
  );
}
