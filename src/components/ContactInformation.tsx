import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter, { CONTACT } from './SiteFooter';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './overview-landing.css';
import './privacy-policy.css';

export default function ContactInformation() {
  useEffect(() => { document.title = 'Giới thiệu & liên hệ | Du Học Thầy Tư'; }, []);

  return <div className="overview-page privacy-page">
    <header className="overview-nav"><div className="overview-wrap overview-nav-inner"><Link className="overview-brand" to="/"><img src="/images/brand-logo.png" alt="" width="46" height="46" /><span>DU HỌC THẦY TƯ</span></Link></div></header>
    <main className="privacy-main overview-wrap">
      <div className="privacy-heading"><span className="overview-section-tag">DU HỌC THẦY TƯ</span><h1>Giới thiệu<br />& liên hệ.</h1><p>Thông tin về đơn vị tư vấn và các kênh để bạn chủ động liên hệ.</p></div>
      <div className="privacy-content">
        <section><h2>Chúng tôi làm gì?</h2><p>{CONTACT.name} tư vấn định hướng du học Hàn Quốc và đào tạo tiếng Hàn tại Hà Nội. Chúng tôi cùng học viên và gia đình xem điều kiện hồ sơ, phương án trường, lộ trình và các khoản chi phí trước khi quyết định.</p></section>
        <section><h2>Liên hệ trực tiếp</h2><p>Văn phòng: {CONTACT.address}<br />Hotline/Zalo: <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a><br />Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p></section>
        <section><h2>Bắt đầu từ xa</h2><p>Bạn có thể <Link to="/tu-van-du-hoc-han-quoc-online#dat-lich">gửi yêu cầu tư vấn online</Link> và chọn thời gian mong muốn. Đội ngũ sẽ liên hệ xác nhận trước buổi trao đổi. Nếu muốn tự xem các khoản chi phí dự tính, bạn có thể mở <Link to="/du-hoc-han-quoc">trang báo giá du học Hàn Quốc</Link>.</p></section>
      </div>
    </main>
    <SiteFooter />
  </div>;
}
