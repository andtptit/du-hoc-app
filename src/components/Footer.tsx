import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT } from './SiteFooter';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-4 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0255597007.firebasestorage.app/o/Logo%20TH%20va%20DH-ngang.png?alt=media&token=5acd9018-e5a4-4878-a737-0839cfc9d4b2"
          alt="Tiếng Hàn và Du Học Thầy Tư"
          className="h-12 mb-8"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Tieng+Han+va+Du+Hoc+Thay+Tu&background=0f3493&color=fff';
          }}
        />

        <div className="text-center space-y-2 mb-12 text-sm text-slate-600">
          <p className="font-bold">{CONTACT.name}</p>
          <p>{CONTACT.address}</p>
          <p>Hotline/Zalo: <a href={`tel:${CONTACT.phone}`} className="text-blue-700 underline">{CONTACT.phone}</a></p>
          <p>Email: <a href={`mailto:${CONTACT.email}`} className="text-blue-700 underline">{CONTACT.email}</a></p>
        </div>

        <div className="w-full h-px bg-slate-100 mb-8" />

        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-slate-400 font-medium">
          <p>© Bản quyền của Tiếng Hàn và Du Học Thầy Tư</p>
          <div className="flex gap-8">
            <Link to="/chinh-sach-bao-mat" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">Các mốc chi phí và tỷ lệ visa phụ thuộc vào kết quả xét duyệt thực tế của Cục Xuất nhập cảnh Hàn Quốc và chính sách từng kỳ của nhà trường.</p>
      </div>
    </footer>
  );
}
