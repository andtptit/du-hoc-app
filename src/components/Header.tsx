import React from 'react';
import { PhoneCall, Settings, List, LogOut, UserLock } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onLoginClick: () => void;
  onManageUnis: () => void;
  onManageRegs: () => void;
  onLogout: () => void;
}

export default function Header({ 
  isAdmin, 
  onLoginClick, 
  onManageUnis, 
  onManageRegs, 
  onLogout 
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <img 
              src="https://tbtgroup.vn/wp-content/uploads/2023/11/logo-tbt.png" 
              alt="TBT GROUP" 
              className="h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=TBT+Group&background=0f3493&color=fff';
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

          <div className="h-6 w-px bg-slate-100 mx-1 hidden sm:block" />

          <button className="bg-[#0f3493] text-white px-5 py-2.5 rounded-full font-bold text-[13px] flex items-center gap-2 hover:bg-blue-800 transition-all shadow-md active:scale-95 whitespace-nowrap">
            <PhoneCall className="w-4 h-4" />
            <span className="hidden sm:inline">Nhận tư vấn du học</span>
            <span className="sm:hidden">Tư vấn</span>
          </button>
        </div>
      </div>
    </header>
  );
}
