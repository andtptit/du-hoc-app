import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter, { CONTACT } from './SiteFooter';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './overview-landing.css';
import './privacy-policy.css';

export default function ConsultationTerms() {
  useEffect(() => { document.title = 'Thông tin đặt lịch tư vấn | Du Học Thầy Tư'; }, []);

  return <div className="overview-page privacy-page">
    <header className="overview-nav"><div className="overview-wrap overview-nav-inner"><Link className="overview-brand" to="/"><img src="/images/brand-logo.png" alt="" width="46" height="46" /><span>DU HỌC THẦY TƯ</span></Link></div></header>
    <main className="privacy-main overview-wrap">
      <div className="privacy-heading"><span className="overview-section-tag">TRƯỚC BUỔI TRAO ĐỔI</span><h1>Thông tin<br />đặt lịch.</h1><p>Những điều bạn cần biết khi gửi yêu cầu tư vấn online.</p></div>
      <div className="privacy-content">
        <section><h2>1. Gửi yêu cầu và xác nhận</h2><p>Ngày giờ bạn chọn trên form là thời gian mong muốn, chưa phải lịch hẹn được xác nhận. Đội ngũ sẽ liên hệ qua Zalo hoặc điện thoại theo lựa chọn của bạn để thống nhất thời gian cụ thể.</p></section>
        <section><h2>2. Nội dung và chi phí</h2><p>Buổi tư vấn định hướng ban đầu dự kiến 20 phút và miễn phí. Nội dung tập trung vào điều kiện hồ sơ, hướng chọn trường, lộ trình, chi phí dự tính và những câu hỏi bạn ưu tiên. Nếu cần sử dụng dịch vụ tiếp theo, trung tâm sẽ thông tin khoản phí để bạn tự quyết định.</p></section>
        <section><h2>3. Tư vấn từ xa và thay đổi lịch</h2><p>Bạn có thể bắt đầu trao đổi online mà không cần đến văn phòng tại Hà Nội. Nếu cần đổi thời gian hoặc không còn nhu cầu, hãy liên hệ hotline/Zalo <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a> hoặc email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p></section>
        <section><h2>4. Thông tin tham khảo</h2><p>Phương án tư vấn phụ thuộc vào hồ sơ thực tế của từng người. Điều kiện tuyển sinh, học phí và các khoản liên quan có thể thay đổi theo trường và kỳ tuyển sinh. Kết quả xét duyệt visa thuộc cơ quan có thẩm quyền; buổi tư vấn không bảo đảm một kết quả tuyển sinh hoặc visa cụ thể.</p></section>
        <section><h2>5. Dữ liệu bạn gửi</h2><p>Chúng tôi dùng thông tin bạn cung cấp để xác nhận lịch và tư vấn theo yêu cầu. Cách thu thập, lưu trữ và quyền của bạn được nêu trong <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>.</p></section>
      </div>
    </main>
    <SiteFooter />
  </div>;
}
