/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, Phone, Mail, Globe, ArrowRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { auth } from '../firebase';

interface HeaderProps {
  selectedUniName: string;
  user: User | null;
  isAdmin: boolean;
  onLogin: () => void;
  onOpenSettings: () => void;
  onOpenRegistrations: () => void;
  onOpenUniversities: () => void;
}

export default function Header({
  selectedUniName,
  user,
  isAdmin,
  onLogin,
  onOpenSettings,
  onOpenRegistrations,
  onOpenUniversities,
}: HeaderProps) {
  return (
    <header className="bg-[#1e40af] text-white py-8 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium mb-4 backdrop-blur-sm">
              <Globe className="w-3 h-3" />
              <span>KR Du Học Hàn Quốc - Cơ Hội Vàng!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Du Học Châu Á - Tương Lai Của Bạn Bắt Đầu Tại Đây!
            </h1>
            <p className="text-blue-100 opacity-90 mb-4">
              {selectedUniName || 'Đang tải...'} &amp; 50+ trường hàng đầu Châu Á
            </p>
            <div className="flex flex-wrap gap-4 text-sm opacity-80">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>0123-456-789</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>contact@duhoc.vn</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {!user ? (
              <button
                onClick={onLogin}
                className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
              >
                <Globe className="w-4 h-4" />
                Đăng nhập Admin
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-blue-100">Chào, {user.displayName}</span>
                {isAdmin && (
                  <div className="flex gap-2 items-center flex-wrap justify-end">
                    <button
                      onClick={onOpenRegistrations}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-emerald-600 transition-colors"
                    >
                      DS Đăng ký
                    </button>
                    <button
                      onClick={onOpenUniversities}
                      className="bg-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      🎓 Quản lý Trường
                    </button>
                    <div className="h-4 w-px bg-blue-400/50 mx-1"></div>
                    <button
                      onClick={onOpenSettings}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-600 transition-colors"
                    >
                      Cài đặt
                    </button>
                  </div>
                )}
                <button
                  onClick={() => auth.signOut()}
                  className="text-xs text-blue-200 hover:text-white underline"
                >
                  Đăng xuất
                </button>
              </div>
            )}
            <button className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20">
              <Phone className="w-4 h-4" />
              Tư Vấn Miễn Phí
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-24 -mb-24 blur-2xl" />
    </header>
  );
}
