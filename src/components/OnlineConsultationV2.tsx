import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, Clock3, Menu, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { CONTACT } from './SiteFooter';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import './online-consultation-v2.css';

const GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby2KObaL-ev4jBf1TqZBWli2H4y1aitQyaCCnMG_KWTRD3B6KEttx5JHqng6dHn3i17/exec';
const phonePattern = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;
const topics = [
  { id: 'Chưa biết chọn trường nào', title: 'Chưa biết chọn trường nào', description: 'Thu hẹp lựa chọn theo học lực, tiếng Hàn và khoảng ngân sách gia đình.' },
  { id: 'Đang phân vân vài phương án', title: 'Đang phân vân vài phương án', description: 'Đặt điều kiện, chi phí và lộ trình cạnh nhau để dễ cân nhắc.' },
  { id: 'Mỗi nơi tư vấn một kiểu', title: 'Mỗi nơi tư vấn một kiểu', description: 'Rà soát lại thông tin: điều gì đã rõ, điều gì còn cần kiểm tra.' },
];
const times = ['09:00', '10:30', '14:00', '15:30', '16:30', '19:00'];

function localToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export default function OnlineConsultationV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [educationStatus, setEducationStatus] = useState('');
  const [gpa, setGpa] = useState('');
  const [koreanLevel, setKoreanLevel] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [contactMethod, setContactMethod] = useState('Zalo');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    const existingDescription = document.querySelector('meta[name="description"]');
    const previousDescription = existingDescription?.getAttribute('content');
    const meta = existingDescription ?? document.createElement('meta');
    if (!existingDescription) {
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    document.title = 'Tư vấn định hướng du học Hàn Quốc chuyên sâu | Du Học Thầy Tư';
    meta.setAttribute('content', 'Đặt cuộc tư vấn định hướng du học Hàn Quốc chuyên sâu 20 phút cùng Du Học Thầy Tư. Trao đổi về hồ sơ, chọn trường, học bổng và hành trình du học.');
    return () => {
      document.title = previousTitle;
      if (existingDescription && previousDescription !== null && previousDescription !== undefined) meta.setAttribute('content', previousDescription);
      else if (!existingDescription) meta.remove();
    };
  }, []);

  useEffect(() => {
    const form = document.getElementById('dat-lich');
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      if (!topic || !educationStatus) {
        toast.error('Vui lòng chọn điều bạn muốn trao đổi và tình trạng học tập');
        return;
      }
      setStep(2);
      return;
    }
    if (submitting) return;
    const cleanPhone = phone.replace(/[\s.-]/g, '').trim();
    if (!date || !time) {
      toast.error('Vui lòng chọn ngày và giờ mong muốn');
      return;
    }
    if (date < localToday()) {
      toast.error('Vui lòng chọn ngày hôm nay hoặc ngày sau đó');
      return;
    }
    if (!phonePattern.test(cleanPhone)) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    if (!consent) {
      toast.error('Vui lòng đồng ý để Thầy Tư liên hệ xác nhận lịch');
      return;
    }

    const contactTime = `${date} ${time} (giờ mong muốn, chờ xác nhận)`;
    const classification = 'Tư vấn hồ sơ du học Hàn Quốc online miễn phí';
    const registration = {
      name: name.trim(), phone: cleanPhone, visaType: '', topikLevel: koreanLevel,
      universityId: '', universityName: '', gpaThpt: gpa.trim(), gpaUni: '',
      educationStatus, preferredContactTime: contactTime, preferredContactMethod: contactMethod,
      consultationTopic: topic, createdAt: new Date().toISOString(), costsTotal: 0,
      type: 'dang_ky', leadSource: 'tu-van-du-hoc-han-quoc-online', leadIntent: 'online_consultation',
      budgetRange: '', koreanLanguageOption: '', promotionInterest: '',
    };

    setSubmitting(true);
    try {
      const [{ addDoc, collection }, { db }] = await Promise.all([import('firebase/firestore'), import('../firebasePublic')]);
      await addDoc(collection(db, 'registrations'), registration);
      fetch(GOOGLE_WEBHOOK_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...registration, classification, phanLoai: classification, typeLabel: classification }),
      }).catch((error) => console.error('Google Sheets error:', error));
      (window as Window & { fbq?: (...args: unknown[]) => void }).fbq?.('track', 'Lead', { content_name: classification });
      sessionStorage.setItem('thankYouRequest', JSON.stringify({ kind: 'onlineConsultation', contactTime }));
      window.location.assign('/thank-you');
    } catch (error) {
      console.error('Online consultation lead error:', error);
      toast.error('Chưa gửi được yêu cầu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="consult-page">
    <Toaster position="top-center" />
    <header className="consult-header"><div className="consult-wrap consult-header-inner">
      <Link className="consult-brand" to="/"><img src="/images/brand-logo.png" alt="" width="38" height="38" /><span>DU HỌC THẦY TƯ</span></Link>
      <nav className={menuOpen ? 'consult-nav is-open' : 'consult-nav'} aria-label="Điều hướng trang">
        <a href="#van-de" onClick={() => setMenuOpen(false)}>Bạn đang vướng ở đâu</a>
        <a href="#nhan-duoc" onClick={() => setMenuOpen(false)}>Sau buổi tư vấn</a>
        <a className="consult-nav-cta" href="#dat-lich" onClick={() => setMenuOpen(false)}>Gửi yêu cầu hẹn lịch <ArrowUpRight size={16} /></a>
      </nav>
      <button className="consult-menu" type="button" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </div></header>

    <main>
      <section className="consult-booking" id="dat-lich" aria-labelledby="consult-title"><div className="consult-wrap consult-booking-grid">
        <div className="consult-booking-copy"><span className="consult-eyebrow">DU HỌC HÀN QUỐC · TƯ VẤN ONLINE</span><h1 id="consult-title">Tư vấn định hướng du học <span>chuyên sâu.</span></h1><strong className="consult-availability">Chỉ 20 suất miễn phí / tháng</strong><p>Đặt một cuộc tư vấn chuyên sâu 20 phút, giải đáp mọi thắc mắc của bạn về hồ sơ, chọn trường, học bổng và hành trình du học.</p><div className="consult-booking-promise"><Check size={18} /><span>Không spam tư vấn. Bạn chủ động đặt lịch theo mong muốn.</span></div><div className="consult-schedule-note"><Clock3 size={18} /><span>Khung giờ bạn chọn sẽ được đội ngũ liên hệ xác nhận.</span></div></div>
        <div className="consult-form-panel"><div className="consult-form-heading"><span>{step === 1 ? 'BƯỚC 01 / VẤN ĐỀ CỦA BẠN' : 'BƯỚC 02 / THỜI GIAN & LIÊN HỆ'}</span><h3>{step === 1 ? 'Để cuộc trao đổi đi đúng vấn đề' : 'Chọn thời gian thuận tiện'}</h3><p>{step === 1 ? 'Chỉ cần vài thông tin cơ bản. Chưa cần chuẩn bị đủ giấy tờ.' : 'Thầy Tư sẽ liên hệ xác nhận; đây chưa phải lịch hẹn được chốt.'}</p></div>
          <div className="consult-progress"><span className={step === 1 ? 'is-active' : 'is-done'}>01&nbsp; Hồ sơ</span><span className={step === 2 ? 'is-active' : ''}>02&nbsp; Hẹn lịch</span></div>
          <form onSubmit={submit}>{step === 1 ? <div className="consult-fields">
            <fieldset className="consult-topic-field"><legend>Bạn muốn trao đổi điều gì? <b>*</b></legend>{topics.map((item) => <label key={item.id} className={topic === item.id ? 'is-selected' : ''}><input type="radio" name="consult-topic" value={item.id} checked={topic === item.id} onChange={() => setTopic(item.id)} /><span>{item.title}</span></label>)}</fieldset>
            <div className="consult-field"><label htmlFor="consult-status">Tình trạng học tập <b>*</b></label><select id="consult-status" required value={educationStatus} onChange={(event) => setEducationStatus(event.target.value)}><option value="">Chọn tình trạng hiện tại</option><option value="Đang học lớp 11">Đang học lớp 11</option><option value="Đang học lớp 12">Đang học lớp 12</option><option value="Đã tốt nghiệp THPT">Đã tốt nghiệp THPT</option><option value="Đang học hoặc đã tốt nghiệp đại học">Đang học hoặc đã tốt nghiệp đại học</option></select></div>
            <div className="consult-field-row"><div className="consult-field"><label htmlFor="consult-gpa">Điểm trung bình <small>(nếu nhớ)</small></label><input id="consult-gpa" type="number" min="0" max="10" step="0.1" inputMode="decimal" placeholder="Ví dụ: 7.5" value={gpa} onChange={(event) => setGpa(event.target.value)} /></div><div className="consult-field"><label htmlFor="consult-korean">Tiếng Hàn hiện tại</label><select id="consult-korean" value={koreanLevel} onChange={(event) => setKoreanLevel(event.target.value)}><option value="">Chưa rõ / chưa học</option><option value="Đang học, chưa có TOPIK">Đang học, chưa có TOPIK</option><option value="TOPIK 1–2">TOPIK 1–2</option><option value="TOPIK 3 trở lên">TOPIK 3 trở lên</option></select></div></div>
            <button className="consult-submit" type="submit">Tiếp tục chọn thời gian <ArrowRight size={18} /></button><p className="consult-form-foot">Bước này chưa cần nhập số điện thoại.</p>
          </div> : <div className="consult-fields">
            <button className="consult-back" type="button" onClick={() => setStep(1)}><ChevronLeft size={17} /> Sửa thông tin hồ sơ</button>
            <div className="consult-field"><label htmlFor="consult-date">Ngày muốn trao đổi <b>*</b></label><input id="consult-date" type="date" min={localToday()} required value={date} onChange={(event) => setDate(event.target.value)} /></div>
            <fieldset className="consult-time-field"><legend>Giờ thuận tiện <b>*</b></legend><div>{times.map((value) => <label key={value} className={time === value ? 'is-selected' : ''}><input type="radio" name="consult-time" value={value} checked={time === value} onChange={() => setTime(value)} /><span>{value}</span></label>)}</div></fieldset>
            <div className="consult-field"><label htmlFor="consult-method">Kênh xác nhận lịch</label><select id="consult-method" value={contactMethod} onChange={(event) => setContactMethod(event.target.value)}><option value="Zalo">Nhắn qua Zalo</option><option value="Điện thoại">Gọi điện</option></select></div>
            <div className="consult-field-row"><div className="consult-field"><label htmlFor="consult-name">Tên của bạn <small>(không bắt buộc)</small></label><input id="consult-name" autoComplete="name" placeholder="Cách Thầy Tư xưng hô" value={name} onChange={(event) => setName(event.target.value)} /></div><div className="consult-field"><label htmlFor="consult-phone">Số Zalo / điện thoại <b>*</b></label><input id="consult-phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="09xx xxx xxx" value={phone} onChange={(event) => setPhone(event.target.value)} /></div></div>
            <label className="consult-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>Tôi đồng ý để Du Học Thầy Tư dùng thông tin này để liên hệ xác nhận lịch và tư vấn hồ sơ. <Link to="/chinh-sach-bao-mat" target="_blank">Chính sách bảo mật</Link>.</span></label>
            <button className="consult-submit" type="submit" disabled={submitting}>{submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu hẹn lịch'} <ArrowUpRight size={18} /></button><p className="consult-form-foot">Đội ngũ sẽ xác nhận lại khung giờ với bạn qua {contactMethod === 'Zalo' ? 'Zalo' : 'điện thoại'}.</p>
          </div>}</form>
        </div>
      </div></section>

      <section className="consult-clarity" id="van-de" aria-labelledby="consult-clarity-title"><div className="consult-wrap consult-clarity-grid">
        <div className="consult-clarity-problem"><span className="consult-eyebrow">KHI THÔNG TIN CÀNG NHIỀU, QUYẾT ĐỊNH CÀNG KHÓ</span><h2 id="consult-clarity-title">Đã hỏi nhiều nơi.<br /><span>Vẫn thấy mông lung?</span></h2><p>Bạn không thiếu lời tư vấn. Bạn cần một cuộc trao đổi đủ sâu để nhìn rõ hồ sơ của chính mình.</p><ol><li><span>01</span><strong>Nghe quá nhiều ý kiến</strong><p>Cùng một câu hỏi nhưng bạn nhận được nhiều câu trả lời khác nhau.</p></li><li><span>02</span><strong>Mỗi nơi gợi ý một hướng</strong><p>Trường, hệ học và mức tài chính được nói đến rời rạc, khó đặt cạnh nhau.</p></li><li><span>03</span><strong>Chưa được nghe đủ thông tin</strong><p>Có những thắc mắc chỉ được hẹn “đến trực tiếp rồi trao đổi tiếp”.</p></li></ol></div>
        <div className="consult-clarity-answer"><div className="consult-clarity-answer-top"><span>20 PHÚT VỚI DU HỌC THẦY TƯ</span><strong>20<span>′</span></strong></div><h3>Một cuộc trao đổi để rõ hướng đi.</h3><div className="consult-clarity-steps"><div><span>01 / HỒ SƠ</span><h4>Hiểu tình trạng hiện tại</h4><p>Cùng xem học lực, điều kiện hồ sơ, mục tiêu và khoảng tài chính gia đình dự tính.</p></div><div><span>02 / LỰA CHỌN</span><h4>Đối chiếu trường với thực tế</h4><p>Thông tin về trường được đặt cạnh trải nghiệm của học viên Thầy Tư từng theo học, khi có trường hợp phù hợp để tham khảo.</p></div><div><span>03 / LỘ TRÌNH</span><h4>Giải đáp và thống nhất bước tiếp</h4><p>Trả lời những điều bạn còn phân vân, đề xuất một hướng ưu tiên và nói rõ phần nào cần kiểm tra thêm.</p></div></div></div>
      </div></section>

      <section className="consult-outcome" id="nhan-duoc" aria-labelledby="consult-outcome-title"><div className="consult-wrap consult-outcome-grid">
        <div className="consult-outcome-copy"><span className="consult-eyebrow">SAU BUỔI TƯ VẤN</span><h2 id="consult-outcome-title">Rõ phương án.<br />Rõ lý do.<br />Rõ bước tiếp theo.</h2><p>Thay vì thêm thông tin rời rạc, bạn có phần tóm tắt để tự cân nhắc cùng gia đình.</p>
          <ol><li><span>01</span>Lộ trình nên tìm hiểu trước, dựa trên hồ sơ</li><li><span>02</span>Nhóm trường đáng cân nhắc và lý do</li><li><span>03</span>Những điều còn thiếu và việc cần làm tiếp</li></ol>
        </div>
        <div className="consult-paper-frame"><span className="consult-example-label">VÍ DỤ MINH HỌA</span><div className="consult-paper"><div className="consult-paper-head"><b>DU HỌC THẦY TƯ</b><b>HỒ SƠ / MẪU</b></div><h3>Định hướng sau buổi trao đổi</h3><div className="consult-paper-row"><b>TÌNH TRẠNG</b><span>Đã tốt nghiệp THPT · Đang học tiếng Hàn · Ngân sách cần xác nhận</span></div><div className="consult-paper-row"><b>HƯỚNG XEM</b><span>Bắt đầu so sánh hệ tiếng tại nhóm trường đáp ứng điều kiện hồ sơ.</span></div><div className="consult-paper-row"><b>CẦN KIỂM TRA</b><span>Điều kiện từng kỳ tuyển sinh và mức chi phí theo trường.</span></div><div className="consult-paper-row"><b>BƯỚC TIẾP</b><span>Đối chiếu học bạ, chọn danh sách ngắn rồi xem báo giá chi tiết.</span></div><p>Nội dung minh họa cách trình bày; phương án thực tế phụ thuộc thông tin từng hồ sơ.</p></div></div>
      </div></section>

      <section className="consult-faq consult-wrap" aria-labelledby="consult-faq-title"><div><span className="consult-eyebrow">TRƯỚC KHI BẠN ĐẶT LỊCH</span><h2 id="consult-faq-title">Một vài điều nên biết.</h2></div><div className="consult-faq-list"><details><summary>Chưa biết chọn trường thì có gửi yêu cầu được không?</summary><p>Có. Việc thu hẹp lựa chọn trường theo hồ sơ là một nội dung của buổi tư vấn.</p></details><details><summary>Buổi trao đổi ban đầu có mất phí không?</summary><p>Không. Buổi tư vấn ban đầu miễn phí. Nếu bạn muốn sử dụng dịch vụ tiếp theo, trung tâm sẽ trao đổi rõ các khoản phí trước khi bạn quyết định.</p></details><details><summary>Tôi ở xa Hà Nội thì trao đổi như thế nào?</summary><p>Bạn có thể bắt đầu online qua Zalo hoặc cuộc gọi. Nếu một bước sau này cần thực hiện trực tiếp, đội ngũ sẽ nói rõ trước.</p></details><details><summary>Chọn giờ trên trang đã được xác nhận chưa?</summary><p>Chưa. Đây là giờ bạn mong muốn. Đội ngũ sẽ liên hệ qua kênh bạn chọn để xác nhận lịch cụ thể.</p></details></div></section>
      <aside className="consult-cost"><div className="consult-wrap"><div><span>MUỐN TỰ XEM CHI PHÍ TRƯỚC?</span><strong>Xem khoản dự tính theo trường trước buổi trao đổi.</strong></div><Link to="/du-hoc-han-quoc#nhan-pdf">Xem chi phí du học Hàn Quốc <ArrowUpRight size={17} /></Link></div></aside>
    </main>
    <footer className="consult-footer"><div className="consult-wrap consult-footer-grid"><div><div className="consult-footer-brand"><img src="/images/brand-logo.png" alt="" width="34" height="34" /><strong>{CONTACT.name}</strong></div><p>{CONTACT.address}</p></div><div><a href={`tel:${CONTACT.phone}`}>Hotline: {CONTACT.phone}</a><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link></div></div><div className="consult-wrap consult-footer-note">Các mốc chi phí và tỷ lệ visa phụ thuộc vào kết quả xét duyệt thực tế của Cục Xuất nhập cảnh Hàn Quốc và chính sách từng kỳ của nhà trường.</div></footer>
    <a className={formVisible ? 'consult-mobile-cta is-hidden' : 'consult-mobile-cta'} href="#dat-lich"><Clock3 size={18} /> Gửi yêu cầu hẹn lịch <ArrowUpRight size={17} /></a>
  </div>;
}
