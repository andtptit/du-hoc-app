import { Link } from 'react-router-dom';

export const CONTACT = {
  name: 'DU HỌC THẦY TƯ',
  address: 'Số 79 Đường Ngụy Như Kon Tum, Phường Thanh Xuân, Thành phố Hà Nội, Việt Nam',
  phone: '0967593548',
  email: 'contact@tbtgroup.com.vn',
};

export default function SiteFooter() {
  return (
    <footer className="overview-footer">
      <div className="overview-wrap overview-footer-inner">
        <div className="overview-footer-identity">
          <div className="overview-footer-brand"><img src="/images/brand-logo.png" alt="" width="34" height="34" /><strong>{CONTACT.name}</strong></div>
          <p>{CONTACT.address}</p>
          <a href={`tel:${CONTACT.phone}`}>Hotline: {CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`}>Email: {CONTACT.email}</a>
        </div>
        <div className="overview-footer-links">
          <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
          <Link to="/">Trang chủ</Link>
        </div>
        <p className="overview-footer-disclaimer">Các mốc chi phí và tỷ lệ visa phụ thuộc vào kết quả xét duyệt thực tế của Cục Xuất nhập cảnh Hàn Quốc và chính sách từng kỳ của nhà trường.</p>
      </div>
    </footer>
  );
}
