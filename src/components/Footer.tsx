import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-4 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <img 
          src="https://tbtgroup.vn/wp-content/uploads/2023/11/logo-tbt.png" 
          alt="TBT GROUP" 
          className="h-12 mb-8"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=TBT+Group&background=0f3493&color=fff';
          }}
        />
        
        <div className="text-center space-y-2 mb-12">
          <p className="text-sm font-medium text-slate-500">Giấy chứng nhận đăng ký kinh doanh số 0110503947 do Sở Kế hoạch và Đầu tư TP Hà Nội cấp ngày 24/01/2026</p>
          <p className="text-sm font-medium text-slate-500">Giấy chứng nhận hoạt động đào tạo, bồi dưỡng do Sở Giáo Dục và Đào Tạo Thành Phố Hà Nội cấp ngày 27/04/2021</p>
        </div>

        <div className="w-full h-px bg-slate-100 mb-8" />

        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-slate-400 font-medium">
          <p>© Bản quyền của Công Ty Cổ Phần Quốc Tế TBT GROUP</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-600 transition-colors">Về chúng tôi</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Tuyển dụng</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
