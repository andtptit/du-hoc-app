import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter, { CONTACT } from './SiteFooter';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './overview-landing.css';
import './privacy-policy.css';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Chính sách bảo mật | Du Học Thầy Tư';
  }, []);

  return (
    <div className="overview-page privacy-page">
      <header className="overview-nav"><div className="overview-wrap overview-nav-inner"><Link className="overview-brand" to="/"><img src="/images/brand-logo.png" alt="" width="46" height="46" /><span>DU HỌC THẦY TƯ</span></Link></div></header>
      <main className="privacy-main overview-wrap">
        <div className="privacy-heading"><span className="overview-section-tag">THÔNG TIN DÀNH CHO KHÁCH HÀNG</span><h1>Chính sách<br />bảo mật.</h1><p>Chúng tôi giải thích thông tin được thu thập khi bạn xem báo giá, yêu cầu tài liệu hoặc liên hệ tư vấn trên website này.</p></div>
        <div className="privacy-content">
          <section><h2>1. Thông tin chúng tôi thu thập</h2><p>Khi bạn gửi yêu cầu, chúng tôi nhận số điện thoại/Zalo và các lựa chọn bạn cung cấp, chẳng hạn trường, hệ học, trình độ TOPIK và ngân sách dự kiến. Khi bạn truy cập website, các công cụ đo lường có thể thu thập dữ liệu kỹ thuật như lượt xem trang, thiết bị và nguồn truy cập theo cấu hình của công cụ.</p></section>
          <section><h2>2. Mục đích sử dụng</h2><p>Chúng tôi dùng thông tin liên hệ để phản hồi yêu cầu, gửi tài liệu chi phí du học Hàn Quốc qua Zalo và tư vấn phương án phù hợp. Dữ liệu đo lường giúp chúng tôi kiểm tra hoạt động website và hiệu quả quảng cáo. Bạn có thể xem phần báo giá dự tính trên trang mà không cần cung cấp số điện thoại.</p></section>
          <section><h2>3. Lưu trữ và đơn vị cung cấp dịch vụ</h2><p>Yêu cầu của bạn được lưu trong hệ thống Firebase và chuyển tới bảng quản lý nội bộ qua Google Sheets để đội ngũ xử lý. Website cũng sử dụng Google Tag Manager và Meta Pixel để đo lường. Các nhà cung cấp này xử lý dữ liệu theo vai trò cung cấp hạ tầng và đo lường; chúng tôi không bán số điện thoại/Zalo của bạn hoặc chia sẻ cho một bên khác để họ tự tiếp thị.</p></section>
          <section><h2>4. Thời gian lưu và lựa chọn của bạn</h2><p>Thông tin được lưu trong thời gian cần thiết để xử lý yêu cầu và quản lý việc tư vấn. Bạn có thể liên hệ để hỏi về dữ liệu đã cung cấp hoặc yêu cầu cập nhật, ngừng liên hệ, xóa thông tin. Chúng tôi sẽ kiểm tra và phản hồi theo thông tin liên hệ bên dưới.</p></section>
          <section><h2>5. Liên hệ</h2><p>Đơn vị tiếp nhận: <strong>{CONTACT.name}</strong><br />Địa chỉ: {CONTACT.address}<br />Hotline/Zalo: <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a><br />Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p></section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
