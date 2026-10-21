import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import SiteFooter from './SiteFooter';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './overview-landing.css';
import './thank-you.css';

type RequestContext = { universityName?: string; isSuggestion?: boolean };

export default function ThankYou() {
  const [request] = useState<RequestContext>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('thankYouRequest') || '{}') as RequestContext;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    document.title = 'Cảm ơn bạn đã gửi yêu cầu | Du Học Thầy Tư';
  }, []);

  return (
    <div className="overview-page thank-you-page">
      <header className="overview-nav">
        <div className="overview-wrap overview-nav-inner">
          <Link className="overview-brand" to="/"><img src="/images/brand-logo.png" alt="" width="46" height="46" /><span>DU HỌC THẦY TƯ</span></Link>
        </div>
      </header>
      <main className="thank-you-main overview-wrap">
        <div className="thank-you-copy">
          <span className="thank-you-mark"><Check size={29} strokeWidth={2.5} aria-hidden="true" /></span>
          <p className="overview-section-tag">ĐÃ NHẬN YÊU CẦU</p>
          <h1>Cảm ơn bạn<br />đã để lại thông tin.</h1>
          <p className="thank-you-lead">{request.universityName ? `Đội ngũ Thầy Tư sẽ chuẩn bị thông tin chi phí của ${request.universityName} và liên hệ với bạn qua Zalo.` : request.isSuggestion ? 'Đội ngũ Thầy Tư sẽ xem lựa chọn của bạn, gợi ý trường phù hợp và liên hệ qua Zalo.' : 'Đội ngũ Thầy Tư sẽ kiểm tra yêu cầu và liên hệ với bạn qua Zalo để gửi thông tin chi phí.'}</p>
          <div className="thank-you-note"><strong>Trong lúc chờ tài liệu</strong><span>Bạn có thể tự xem chi phí dự tính theo trường và hệ học ngay trên website.</span></div>
          <a className="thank-you-action" href="/du-hoc-han-quoc#xem-bao-gia">Tự xem báo giá <ArrowUpRight size={18} /></a>
        </div>
        <figure className="thank-you-photo"><img src="/images/center/airport-960.webp" alt="Học viên và gia đình tại sân bay trước chuyến đi Hàn Quốc" /><figcaption>DU HỌC THẦY TƯ · HÀNH TRÌNH HÀN QUỐC</figcaption></figure>
      </main>
      <SiteFooter />
    </div>
  );
}
