import React from 'react';
import { PhoneCall, Settings, List, LogOut, UserLock } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onLoginClick: () => void;
  onManageUnis: () => void;
  onManageRegs: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export default function Header({
  isAdmin,
  onLoginClick,
  onManageUnis,
  onManageRegs,
  onSettingsClick,
  onLogout
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0255597007.firebasestorage.app/o/Logo%20TH%20va%20DH-ngang.png?alt=media&token=5acd9018-e5a4-4878-a737-0839cfc9d4b2"
              alt="Tiếng Hàn và Du Học Thầy Tư"
              className="h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Tieng+Han+va+Du+Hoc+Thay+Tu&background=0f3493&color=fff';
              }}
            />
          </div>

          {/* Admin Quick Actions */}
          {isAdmin && (
            <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
              <button
                onClick={onManageUnis}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-[#0f3493] rounded-xl transition-all hover:shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                Quản lý trường
              </button>
              <button
                onClick={onManageRegs}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-[#0f3493] rounded-xl transition-all hover:shadow-sm"
              >
                <List className="w-3.5 h-3.5" />
                Danh sách ĐK
              </button>
              <button
                onClick={onSettingsClick}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white hover:text-[#0f3493] rounded-xl transition-all hover:shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                Cài đặt
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="p-2.5 text-slate-400 hover:text-[#0f3493] hover:bg-blue-50 rounded-full transition-all"
              title="Đăng nhập Admin"
            >
              <UserLock className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
