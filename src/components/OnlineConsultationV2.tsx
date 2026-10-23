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
    document.title = 'Tư vấn hồ sơ du học Hàn Quốc online | Du Học Thầy Tư';
    meta.setAttribute('content', 'Đã nghe nhiều lời tư vấn nhưng chưa biết chọn hướng nào? Cùng Du Học Thầy Tư rà soát hồ sơ, thu hẹp lựa chọn trường và chọn giờ trao đổi online phù hợp.');
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

  const chooseTopic = (value: string) => {
    setTopic(value);
    document.getElementById('dat-lich')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
      <section className="consult-hero" aria-labelledby="consult-title"><div className="consult-wrap consult-hero-grid">
        <div className="consult-hero-copy"><span className="consult-eyebrow">TƯ VẤN HỒ SƠ DU HỌC HÀN QUỐC · ONLINE</span>
          <h1 id="consult-title">Nghe nhiều rồi.<br /><span>Giờ cần một hướng đi rõ ràng.</span></h1>
          <p>Cùng Thầy Tư xem hồ sơ, thu hẹp lựa chọn trường và lộ trình phù hợp với năng lực, tài chính của bạn. Bắt đầu online, chưa cần ra Hà Nội.</p>
          <a className="consult-primary" href="#dat-lich">Gửi yêu cầu hẹn lịch <ArrowUpRight size={19} /></a>
          <small>Chọn giờ mong muốn. Đội ngũ sẽ liên hệ để xác nhận lịch.</small>
        </div>
        <figure className="consult-hero-photo"><img src="/images/marketing/tu-van-thay-tu.jpg" width="2048" height="1536" alt="Buổi tư vấn hồ sơ tại Du Học Thầy Tư" fetchPriority="high" /><figcaption>BUỔI TƯ VẤN TẠI DU HỌC THẦY TƯ</figcaption></figure>
      </div></section>

      <div className="consult-thesis"><div className="consult-wrap"><strong>Đừng nhận thêm một danh sách trường dài.</strong><p>Điều bạn cần là biết trường nào đáng tìm hiểu trước, vì sao phù hợp và phần nào trong hồ sơ còn phải kiểm tra.</p></div></div>

      <section className="consult-problems consult-wrap" id="van-de" aria-labelledby="consult-problems-title">
        <div className="consult-section-top"><div><span className="consult-eyebrow">BẮT ĐẦU TỪ ĐIỀU BẠN ĐANG PHÂN VÂN</span><h2 id="consult-problems-title">Bạn đang mắc ở bước nào?</h2></div><p>Không cần biết sẵn tên trường hay hệ du học. Chọn vấn đề gần với bạn nhất để buổi tư vấn đi thẳng vào việc cần giải quyết.</p></div>
        <div className="consult-problem-list">{topics.map((item, index) => <button key={item.id} className={topic === item.id ? 'consult-problem is-selected' : 'consult-problem'} type="button" onClick={() => chooseTopic(item.id)}><span>0{index + 1}</span><strong>{item.title}</strong><p>{item.description}</p><ArrowUpRight size={18} aria-hidden="true" /></button>)}</div>
      </section>

      <section className="consult-outcome" id="nhan-duoc" aria-labelledby="consult-outcome-title"><div className="consult-wrap consult-outcome-grid">
        <div className="consult-outcome-copy"><span className="consult-eyebrow">SAU BUỔI TƯ VẤN</span><h2 id="consult-outcome-title">Rõ phương án.<br />Rõ lý do.<br />Rõ bước tiếp theo.</h2><p>Thay vì thêm thông tin rời rạc, bạn có phần tóm tắt để tự cân nhắc cùng gia đình.</p>
          <ol><li><span>01</span>Lộ trình nên tìm hiểu trước, dựa trên hồ sơ</li><li><span>02</span>Nhóm trường đáng cân nhắc và lý do</li><li><span>03</span>Những điều còn thiếu và việc cần làm tiếp</li></ol>
        </div>
        <div className="consult-paper-frame"><span className="consult-example-label">VÍ DỤ MINH HỌA</span><div className="consult-paper"><div className="consult-paper-head"><b>DU HỌC THẦY TƯ</b><b>HỒ SƠ / MẪU</b></div><h3>Định hướng sau buổi trao đổi</h3><div className="consult-paper-row"><b>TÌNH TRẠNG</b><span>Đã tốt nghiệp THPT · Đang học tiếng Hàn · Ngân sách cần xác nhận</span></div><div className="consult-paper-row"><b>HƯỚNG XEM</b><span>Bắt đầu so sánh hệ tiếng tại nhóm trường đáp ứng điều kiện hồ sơ.</span></div><div className="consult-paper-row"><b>CẦN KIỂM TRA</b><span>Điều kiện từng kỳ tuyển sinh và mức chi phí theo trường.</span></div><div className="consult-paper-row"><b>BƯỚC TIẾP</b><span>Đối chiếu học bạ, chọn danh sách ngắn rồi xem báo giá chi tiết.</span></div><p>Nội dung minh họa cách trình bày; phương án thực tế phụ thuộc thông tin từng hồ sơ.</p></div></div>
      </div></section>

      <section className="consult-booking" id="dat-lich" aria-labelledby="consult-booking-title"><div className="consult-wrap consult-booking-grid">
        <div className="consult-booking-copy"><span className="consult-eyebrow">HẸN THỜI GIAN PHÙ HỢP VỚI BẠN</span><h2 id="consult-booking-title">Chọn giờ bạn muốn trao đổi.</h2><p>Cho Thầy Tư biết vấn đề bạn đang phân vân và thời gian thuận tiện. Đội ngũ sẽ chuẩn bị nội dung, liên hệ xác nhận lịch qua kênh bạn chọn.</p><ul><li><Check size={17} />Tư vấn ban đầu miễn phí</li><li><Check size={17} />Có thể trao đổi online, chưa cần ra Hà Nội</li><li><Check size={17} />Bạn quyết định có tiếp tục sau buổi tư vấn</li></ul><div className="consult-schedule-note"><Clock3 size={18} /><span>Giờ bạn chọn là mong muốn, chưa phải lịch đã xác nhận.</span></div></div>
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

      <section className="consult-faq consult-wrap" aria-labelledby="consult-faq-title"><div><span className="consult-eyebrow">TRƯỚC KHI BẠN ĐẶT LỊCH</span><h2 id="consult-faq-title">Một vài điều nên biết.</h2></div><div className="consult-faq-list"><details><summary>Chưa biết chọn trường thì có gửi yêu cầu được không?</summary><p>Có. Việc thu hẹp lựa chọn trường theo hồ sơ là một nội dung của buổi tư vấn.</p></details><details><summary>Buổi trao đổi ban đầu có mất phí không?</summary><p>Không. Buổi tư vấn ban đầu miễn phí. Nếu bạn muốn sử dụng dịch vụ tiếp theo, trung tâm sẽ trao đổi rõ các khoản phí trước khi bạn quyết định.</p></details><details><summary>Tôi ở xa Hà Nội thì trao đổi như thế nào?</summary><p>Bạn có thể bắt đầu online qua Zalo hoặc cuộc gọi. Nếu một bước sau này cần thực hiện trực tiếp, đội ngũ sẽ nói rõ trước.</p></details><details><summary>Chọn giờ trên trang đã được xác nhận chưa?</summary><p>Chưa. Đây là giờ bạn mong muốn. Đội ngũ sẽ liên hệ qua kênh bạn chọn để xác nhận lịch cụ thể.</p></details></div></section>
      <aside className="consult-cost"><div className="consult-wrap"><div><span>MUỐN TỰ XEM CHI PHÍ TRƯỚC?</span><strong>Xem khoản dự tính theo trường trước buổi trao đổi.</strong></div><Link to="/du-hoc-han-quoc#nhan-pdf">Xem chi phí du học Hàn Quốc <ArrowUpRight size={17} /></Link></div></aside>
    </main>
    <footer className="consult-footer"><div className="consult-wrap consult-footer-grid"><div><div className="consult-footer-brand"><img src="/images/brand-logo.png" alt="" width="34" height="34" /><strong>{CONTACT.name}</strong></div><p>{CONTACT.address}</p></div><div><a href={`tel:${CONTACT.phone}`}>Hotline: {CONTACT.phone}</a><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link></div></div><div className="consult-wrap consult-footer-note">Các mốc chi phí và tỷ lệ visa phụ thuộc vào kết quả xét duyệt thực tế của Cục Xuất nhập cảnh Hàn Quốc và chính sách từng kỳ của nhà trường.</div></footer>
    <a className={formVisible ? 'consult-mobile-cta is-hidden' : 'consult-mobile-cta'} href="#dat-lich"><Clock3 size={18} /> Gửi yêu cầu hẹn lịch <ArrowUpRight size={17} /></a>
  </div>;
}
