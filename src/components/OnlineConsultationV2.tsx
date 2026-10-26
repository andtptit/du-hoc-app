import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Clock3, Menu, X } from 'lucide-react';
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
const quickTimes = Array.from({ length: 23 }, (_, index) => {
  const minutes = 9 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});
const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function localDateValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function localToday() {
  return localDateValue(new Date());
}

function defaultConsultationDate() {
  const now = new Date();
  if (now.getHours() < 19 || (now.getHours() === 19 && now.getMinutes() < 30)) return localToday();
  now.setDate(now.getDate() + 1);
  return localDateValue(now);
}

export default function OnlineConsultationV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [educationStatus, setEducationStatus] = useState('');
  const [gpa, setGpa] = useState('');
  const [koreanLevel, setKoreanLevel] = useState('');
  const [date, setDate] = useState(defaultConsultationDate);
  const [time, setTime] = useState('19:30');
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = defaultConsultationDate();
    return new Date(Number(initial.slice(0, 4)), Number(initial.slice(5, 7)) - 1, 1);
  });
  const [contactMethod, setContactMethod] = useState('Zalo');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(monthStart.getFullYear(), monthStart.getMonth(), index - monthStart.getDay() + 1);
    return { value: localDateValue(day), day: day.getDate(), currentMonth: day.getMonth() === monthStart.getMonth() };
  });
  const selectedDateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const today = localToday();

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
      if (!date || !time || new Date(`${date}T${time}:00`).getTime() <= Date.now()) {
        toast.error('Vui lòng chọn ngày giờ chưa qua');
        return;
      }
      setStep(2);
      return;
    }
    if (submitting) return;
    if (!topic || !educationStatus) {
      toast.error('Vui lòng chọn nội dung tư vấn và tình trạng học tập');
      return;
    }
    const cleanPhone = phone.replace(/[\s.-]/g, '').trim();
    if (!date || !time) {
      toast.error('Vui lòng chọn ngày và giờ mong muốn');
      return;
    }
    if (date < localToday()) {
      toast.error('Vui lòng chọn ngày hôm nay hoặc ngày sau đó');
      return;
    }
    if (new Date(`${date}T${time}:00`).getTime() <= Date.now()) {
      toast.error('Giờ bạn chọn đã qua. Vui lòng chọn giờ khác.');
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
        <a href="#van-de" onClick={() => setMenuOpen(false)}>Cách Thầy Tư tư vấn</a>
        <a href="#ve-thay-tu" onClick={() => setMenuOpen(false)}>Về Thầy Tư</a>
        <a className="consult-nav-cta" href="#dat-lich" onClick={() => setMenuOpen(false)}>Gửi yêu cầu hẹn lịch <ArrowUpRight size={16} /></a>
      </nav>
      <button className="consult-menu" type="button" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </div></header>

    <main>
      <section className="consult-booking" id="dat-lich" aria-labelledby="consult-title"><div className="consult-wrap consult-booking-grid">
        <div className="consult-booking-copy"><span className="consult-eyebrow">DU HỌC HÀN QUỐC · TƯ VẤN ONLINE</span><h1 id="consult-title">Tư vấn định hướng du học <span>chuyên sâu.</span></h1><div className="consult-availability"><strong><span>Chỉ còn lại</span><b>9/20</b><span>suất miễn phí</span></strong><div className="consult-availability-track" role="progressbar" aria-label="11 trên 20 suất đã được đăng ký" aria-valuemin={0} aria-valuemax={20} aria-valuenow={11}><span /></div></div><p>Đặt một cuộc tư vấn chuyên sâu 20 phút, giải đáp mọi thắc mắc của bạn về hồ sơ, chọn trường, học bổng và hành trình du học.</p><div className="consult-booking-promise"><Check size={18} /><span>Không spam tư vấn. Bạn chủ động đặt lịch theo mong muốn.</span></div><div className="consult-schedule-note"><Clock3 size={18} /><span>Khung giờ bạn chọn sẽ được đội ngũ liên hệ xác nhận.</span></div></div>
        <div className="consult-form-panel"><div className="consult-form-heading"><span>{step === 1 ? 'BƯỚC 01 / CHỌN NGÀY GIỜ' : 'BƯỚC 02 / THÔNG TIN TƯ VẤN'}</span><h3>{step === 1 ? 'Chọn lúc bạn thuận tiện' : 'Cho Thầy Tư biết về bạn'}</h3><p>{step === 1 ? 'Chọn ngày và giờ muốn trao đổi. Bạn có thể đổi sau khi đội ngũ liên hệ xác nhận.' : 'Chỉ cần thông tin cơ bản để cuộc trao đổi đi đúng vấn đề.'}</p></div>
          <div className="consult-progress"><span className={step === 1 ? 'is-active' : 'is-done'}>01&nbsp; Chọn lịch</span><span className={step === 2 ? 'is-active' : ''}>02&nbsp; Thông tin</span></div>
          <form onSubmit={submit}>{step === 1 ? <div className="consult-fields">
            <div className="consult-calendar-layout"><div className="consult-calendar"><div className="consult-calendar-head"><strong>Tháng {visibleMonth.getMonth() + 1} {visibleMonth.getFullYear()}</strong><div><button type="button" aria-label="Tháng trước" disabled={visibleMonth.getFullYear() === Number(today.slice(0, 4)) && visibleMonth.getMonth() === Number(today.slice(5, 7)) - 1} onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}><ChevronLeft size={18} /></button><button type="button" aria-label="Tháng sau" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><ChevronRight size={18} /></button></div></div><div className="consult-calendar-days">{weekdays.map((day) => <span key={day}>{day}</span>)}{calendarDays.map((day) => <button key={day.value} type="button" disabled={!day.currentMonth || day.value < today} className={day.value === date ? 'is-selected' : ''} aria-label={`Ngày ${day.day} tháng ${visibleMonth.getMonth() + 1}`} aria-pressed={day.value === date} onClick={() => setDate(day.value)}>{day.currentMonth ? day.day : ''}</button>)}</div></div>
            <div className="consult-slot-column"><strong>{selectedDateLabel}</strong><span>Chọn giờ mong muốn</span><div className="consult-slot-list">{quickTimes.map((value) => <button key={value} type="button" disabled={new Date(`${date}T${value}:00`).getTime() <= Date.now()} className={time === value ? 'is-selected' : ''} aria-pressed={time === value} onClick={() => setTime(value)}>{value}</button>)}</div><label htmlFor="consult-time">Hoặc chọn giờ khác</label><input id="consult-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} /></div></div>
            <p className="consult-form-foot">Đây là giờ bạn đề xuất, chưa phải lịch trống được xác nhận.</p><button className="consult-submit" type="submit">Tiếp tục <ArrowRight size={18} /></button>
          </div> : <div className="consult-fields">
            <button className="consult-back" type="button" onClick={() => setStep(1)}><ChevronLeft size={17} /> Đổi ngày giờ</button><div className="consult-selected-slot"><Clock3 size={17} /><span>{selectedDateLabel} · {time}</span></div>
            <div className="consult-field"><label htmlFor="consult-name">Tên của bạn <small>(không bắt buộc)</small></label><input id="consult-name" autoComplete="name" placeholder="Cách Thầy Tư xưng hô" value={name} onChange={(event) => setName(event.target.value)} /></div>
            <div className="consult-field"><label htmlFor="consult-phone">Số Zalo / điện thoại <b>*</b></label><input id="consult-phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="09xx xxx xxx" value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
            <div className="consult-field"><label htmlFor="consult-topic">Bạn muốn trao đổi điều gì? <b>*</b></label><select id="consult-topic" required value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">Chọn vấn đề bạn đang quan tâm</option>{topics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
            <div className="consult-field"><label htmlFor="consult-status">Tình trạng học tập <b>*</b></label><select id="consult-status" required value={educationStatus} onChange={(event) => setEducationStatus(event.target.value)}><option value="">Chọn tình trạng hiện tại</option><option value="Đang học lớp 11">Đang học lớp 11</option><option value="Đang học lớp 12">Đang học lớp 12</option><option value="Đã tốt nghiệp THPT">Đã tốt nghiệp THPT</option><option value="Đang học hoặc đã tốt nghiệp đại học">Đang học hoặc đã tốt nghiệp đại học</option></select></div>
            <div className="consult-field-row"><div className="consult-field"><label htmlFor="consult-gpa">Điểm trung bình <small>(nếu nhớ)</small></label><input id="consult-gpa" type="number" min="0" max="10" step="0.1" inputMode="decimal" placeholder="Ví dụ: 7.5" value={gpa} onChange={(event) => setGpa(event.target.value)} /></div><div className="consult-field"><label htmlFor="consult-korean">Tiếng Hàn hiện tại</label><select id="consult-korean" value={koreanLevel} onChange={(event) => setKoreanLevel(event.target.value)}><option value="">Chưa rõ / chưa học</option><option value="Đang học, chưa có TOPIK">Đang học, chưa có TOPIK</option><option value="TOPIK 1–2">TOPIK 1–2</option><option value="TOPIK 3 trở lên">TOPIK 3 trở lên</option></select></div></div>
            <div className="consult-field"><label htmlFor="consult-method">Kênh xác nhận lịch</label><select id="consult-method" value={contactMethod} onChange={(event) => setContactMethod(event.target.value)}><option value="Zalo">Nhắn qua Zalo</option><option value="Điện thoại">Gọi điện</option></select></div>
            <label className="consult-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>Tôi đồng ý để Du Học Thầy Tư dùng thông tin này để liên hệ xác nhận lịch và tư vấn hồ sơ. <Link to="/chinh-sach-bao-mat" target="_blank">Chính sách bảo mật</Link>.</span></label>
            <button className="consult-submit" type="submit" disabled={submitting}>{submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu hẹn lịch'} <ArrowUpRight size={18} /></button><p className="consult-form-foot">Đội ngũ sẽ xác nhận lại khung giờ với bạn qua {contactMethod === 'Zalo' ? 'Zalo' : 'điện thoại'}.</p>
          </div>}</form>
        </div>
      </div></section>

      <section className="consult-clarity" id="van-de" aria-labelledby="consult-clarity-title"><div className="consult-wrap consult-clarity-grid">
        <div className="consult-clarity-problem"><span className="consult-eyebrow">TƯ VẤN THEO CÁCH BẠN MUỐN</span><h2 id="consult-clarity-title">Hỏi nhiều nơi.<br /><span>Vẫn khó quyết định?</span></h2><p>Thầy Tư dành thời gian cho đúng vấn đề bạn quan tâm, theo lịch bạn chủ động chọn.</p><ol><li><span>01</span><strong>Bạn chủ động chọn lịch</strong><p>Chọn ngày và giờ thuận tiện. Đội ngũ xác nhận lịch qua kênh liên hệ bạn chọn.</p></li><li><span>02</span><strong>Hỏi đáp đúng trọng tâm</strong><p>Chọn vấn đề bạn quan tâm để cuộc tư vấn tập trung vào hồ sơ và hướng đi của bạn.</p></li><li><span>03</span><strong>Không gọi làm phiền sau tư vấn</strong><p>Buổi tư vấn kết thúc, trung tâm chỉ liên hệ tiếp nếu bạn yêu cầu.</p></li></ol></div>
        <div className="consult-clarity-answer"><div className="consult-clarity-answer-top"><span>20 PHÚT VỚI DU HỌC THẦY TƯ</span><strong>20<span>′</span></strong></div><h3>Đi thẳng vào điều bạn cần biết.</h3><div className="consult-clarity-steps"><div><span>01 / TRƯỚC BUỔI HẸN</span><h4>Chọn điều muốn trao đổi</h4><p>Trên form, bạn chọn chủ đề và cho biết tình trạng học tập để chúng tôi chuẩn bị trước.</p></div><div><span>02 / TRONG BUỔI HẸN</span><h4>Đi thẳng vào hồ sơ của bạn</h4><p>Cùng xem học lực, hướng chọn trường, chi phí dự tính và những điều bạn đang phân vân.</p></div><div><span>03 / SAU BUỔI HẸN</span><h4>Bạn quyết định bước tiếp</h4><p>Không có cuộc gọi tư vấn tiếp theo, trừ khi bạn muốn trao đổi thêm.</p></div></div><a className="consult-clarity-action" href="#dat-lich">Chọn lịch tư vấn của bạn <ArrowUpRight size={17} /></a></div>
      </div></section>

      <section className="consult-about" id="ve-thay-tu" aria-labelledby="consult-about-title"><div className="consult-wrap consult-about-grid">
        <figure className="consult-about-photo"><img src="/images/center/airport-960.webp" srcSet="/images/center/airport-480.webp 480w, /images/center/airport-960.webp 960w" sizes="(max-width: 950px) 100vw, 50vw" alt="Học viên Du Học Thầy Tư tại sân bay trước chuyến bay sang Hàn Quốc" loading="lazy" decoding="async" /><figcaption>Học viên Du Học Thầy Tư tại sân bay</figcaption></figure>
        <div className="consult-about-copy"><span className="consult-eyebrow">VỀ DU HỌC THẦY TƯ</span><h2 id="consult-about-title">Có người cùng bạn xem kỹ hồ sơ, trước khi chọn trường.</h2><p>Du Học Thầy Tư tư vấn du học Hàn Quốc và đào tạo tiếng Hàn tại Hà Nội. Trong buổi trao đổi, chúng tôi bắt đầu từ học lực, điều kiện hồ sơ và tài chính của gia đình để cùng bạn tìm hướng phù hợp.</p><p>Bạn có thể trao đổi online trước. Nếu muốn gặp trực tiếp, văn phòng ở {CONTACT.address}.</p><a href="#dat-lich">Đặt lịch trao đổi với Thầy Tư <ArrowUpRight size={17} /></a></div>
      </div></section>

      <section className="consult-faq consult-wrap" aria-labelledby="consult-faq-title"><div><span className="consult-eyebrow">TRƯỚC KHI BẠN ĐẶT LỊCH</span><h2 id="consult-faq-title">Bạn hỏi, <span className="consult-faq-title-nowrap">Thầy Tư trả lời.</span></h2></div><div className="consult-faq-list"><details><summary>Tôi chưa biết chọn trường hay hệ học, có tư vấn được không?</summary><p>Có. Bạn chỉ cần chia sẻ tình trạng học tập, điều bạn đang phân vân và mức tài chính dự tính. Buổi trao đổi sẽ giúp bạn xác định hướng nên tìm hiểu trước.</p></details><details><summary>Buổi tư vấn 20 phút sẽ nói về những gì?</summary><p>Chúng tôi cùng xem điều kiện hồ sơ, các lựa chọn trường và hệ học, chi phí dự tính và những câu hỏi bạn ưu tiên. Nếu cần kiểm tra thêm điều kiện tuyển sinh, đội ngũ sẽ nói rõ phần đó.</p></details><details><summary>Tôi ở xa Hà Nội, có cần đến văn phòng không?</summary><p>Không cần đến Hà Nội để bắt đầu. Bạn có thể trao đổi online qua Zalo hoặc điện thoại. Nếu một bước về sau cần gặp trực tiếp, đội ngũ sẽ báo trước.</p></details><details><summary>Sau khi gửi form, tôi có bị gọi tư vấn liên tục không?</summary><p>Thông tin của bạn được dùng để xác nhận lịch và tư vấn hồ sơ. Bạn chọn nhận xác nhận qua Zalo hoặc điện thoại; trung tâm không chủ động gửi tư vấn dồn dập.</p></details><details><summary>Giờ tôi chọn trên form đã là lịch hẹn chính thức chưa?</summary><p>Chưa. Đó là thời gian bạn mong muốn. Đội ngũ sẽ liên hệ qua kênh bạn chọn để xác nhận khung giờ cụ thể.</p></details><details><summary>Buổi tư vấn ban đầu có mất phí không?</summary><p>Không. Buổi trao đổi ban đầu miễn phí. Nếu bạn muốn sử dụng dịch vụ tiếp theo, trung tâm sẽ trao đổi rõ các khoản phí để bạn tự quyết định.</p></details></div></section>
      <aside className="consult-cost"><div className="consult-wrap"><div><span>MUỐN TỰ XEM CHI PHÍ TRƯỚC?</span><strong>Xem khoản dự tính theo trường trước buổi trao đổi.</strong></div><Link to="/du-hoc-han-quoc#nhan-pdf">Xem chi phí du học Hàn Quốc <ArrowUpRight size={17} /></Link></div></aside>
    </main>
    <footer className="consult-footer"><div className="consult-wrap consult-footer-grid"><div><div className="consult-footer-brand"><img src="/images/brand-logo.png" alt="" width="34" height="34" /><strong>{CONTACT.name}</strong></div><p>{CONTACT.address}</p></div><div><a href={`tel:${CONTACT.phone}`}>Hotline: {CONTACT.phone}</a><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><Link to="/gioi-thieu-lien-he">Giới thiệu & liên hệ</Link><Link to="/thong-tin-dat-lich">Thông tin đặt lịch</Link><Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link></div></div><div className="consult-wrap consult-footer-note">Thông tin về trường, chi phí và điều kiện tuyển sinh cần được đối chiếu với chính sách từng kỳ của nhà trường. Kết quả xét duyệt visa thuộc cơ quan có thẩm quyền.</div></footer>
    <a className={formVisible ? 'consult-mobile-cta is-hidden' : 'consult-mobile-cta'} href="#dat-lich"><Clock3 size={18} /> Gửi yêu cầu hẹn lịch <ArrowUpRight size={17} /></a>
  </div>;
}
