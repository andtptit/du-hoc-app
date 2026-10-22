import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLandingData } from '../hooks/useLandingData';
import { useCosts } from '../hooks/useCosts';
import SiteFooter from './SiteFooter';
import { VISA_TYPES } from '../data';
import type { CostUniversity, Selections } from '../types';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './overview-landing.css';

const GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby2KObaL-ev4jBf1TqZBWli2H4y1aitQyaCCnMG_KWTRD3B6KEttx5JHqng6dHn3i17/exec';
const formatVnd = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} ₫`;
const phonePattern = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;
const featuredSchools = [
  { id: 'i-hc-ajou', label: 'AJOU' },
  { id: 'i-hc-catholic', label: 'CATHOLIC' },
  { id: 'i-hc-keimyung', label: 'KEIMYUNG' },
];

const costGroups = [
  {
    title: 'Học tiếng & xử lý hồ sơ',
    description: 'Gói học tiếng tùy trình độ; phí tư vấn và chuẩn bị hồ sơ.',
    payer: 'TRUNG TÂM THU',
  },
  {
    title: 'Phí bên thứ ba',
    description: 'Công chứng, dịch thuật và các khoản liên quan.',
    payer: 'HỌC VIÊN TỰ NỘP',
  },
  {
    title: 'Học phí & lệ phí trường',
    description: 'Thay đổi theo trường, chương trình và kỳ học.',
    payer: 'NỘP CHO TRƯỜNG',
  },
  {
    title: 'Chỗ ở & vé máy bay',
    description: 'Lựa chọn theo nhu cầu và thời điểm đi.',
    payer: 'THEO LỰA CHỌN',
  },
];

function normalizeSchoolName(value: string) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

function SchoolPicker({ id, label, value, universities, onChange, loading, error, onRetry, onOpen }: {
  id: string;
  label: string;
  value: string;
  universities: CostUniversity[];
  onChange: (value: string) => void;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = universities.find((university) => university.id === value);
  const normalizedQuery = normalizeSchoolName(query.trim());
  const matches = normalizedQuery
    ? universities.filter((university) => normalizeSchoolName(university.name).includes(normalizedQuery))
    : universities;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    searchRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return <>
    <label htmlFor={id}>{label}</label>
    <button id={id} ref={triggerRef} type="button" className="overview-school-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => { onOpen(); setQuery(''); setOpen(true); }}>
      <span>{selected?.name ?? (loading ? 'Chọn trường · đang tải danh sách' : 'Chọn một trường')}</span><span aria-hidden="true">⌄</span>
    </button>
    {open && createPortal(<div className="overview-school-overlay" onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="overview-school-dialog" role="dialog" aria-modal="true" aria-label={label}>
        <div className="overview-school-dialog-head"><div><small>CHỌN TRƯỜNG</small><h3>{label}</h3></div><button type="button" aria-label="Đóng danh sách trường" onClick={() => setOpen(false)}><X size={21} /></button></div>
        <input ref={searchRef} type="search" aria-label="Tìm trường theo tên" placeholder="Nhập tên trường để tìm nhanh" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="overview-school-results" aria-label="Danh sách trường">{loading ? <p role="status">Đang tải danh sách trường, vui lòng chờ trong giây lát...</p> : error ? <div className="overview-school-error" role="alert"><p>Chưa tải được danh sách trường.</p><button type="button" onClick={onRetry}>Thử tải lại</button></div> : matches.length ? matches.map((university) => <button type="button" aria-pressed={value === university.id} key={university.id} onClick={() => { onChange(university.id); setOpen(false); }}>{university.name}</button>) : <p>Không tìm thấy trường phù hợp.</p>}</div>
        {!loading && !error && <small className="overview-school-count">{matches.length} trường</small>}
      </div>
    </div>, document.body)}
  </>;
}

export default function OverviewLanding() {
  const [loadSchoolData, setLoadSchoolData] = useState(false);
  const { universities, globalConfig, schoolsLoading, schoolsError, retrySchools } = useLandingData(loadSchoolData);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pdfPhone, setPdfPhone] = useState('');
  const [pdfConsent, setPdfConsent] = useState(false);
  const [documentSchool, setDocumentSchool] = useState('');
  const [documentVisa, setDocumentVisa] = useState('d4-1');
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loadSchoolData) return;
    const startLoading = () => setLoadSchoolData(true);
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startLoading();
    });
    const documentSection = document.getElementById('nhan-pdf');
    if (documentSection) observer.observe(documentSection);
    if (window.location.hash || window.scrollY > 0) startLoading();
    return () => observer.disconnect();
  }, [loadSchoolData]);

  const sortedUniversities = useMemo(
    () => [...universities].sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    [universities]
  );
  const documentUniversity = universities.find((university) => university.id === documentSchool);
  const documentSelections: Selections = useMemo(() => ({ consultingIdx: 0, koreanLangIdx: 0, dormVnMonths: 0, dormKrIdx: 0, flightIdx: 0, scholarshipPercent: 0 }), []);
  const documentCosts = useCosts({ selectedUni: documentUniversity, visaTypeId: documentVisa, topikLevelId: '0', exchangeRate: globalConfig.exchangeRate, globalConfig, selections: documentSelections });
  const documentVisaField = VISA_TYPES.find((item) => item.id === documentVisa)?.field as keyof NonNullable<typeof documentUniversity> | undefined;
  const documentHasTuition = !!(documentUniversity && documentVisaField && Number(documentUniversity[documentVisaField]) > 0);
  const documentPreviewRows = [
    { label: 'Học tiếng tại trung tâm', payer: 'Trung tâm thu', value: documentCosts.koreanLangCost ?? 0 },
    { label: 'Tư vấn & xử lý hồ sơ', payer: 'Trung tâm thu', value: documentCosts.consultingFee ?? 0 },
    { label: 'Phí bên thứ ba', payer: 'Học viên tự nộp', value: documentCosts.thirdPartyFee ?? 0 },
    { label: 'Phí xét tuyển & nhập học', payer: 'Nộp cho trường', value: (documentCosts.applicationFee ?? 0) + (documentCosts.enrollmentFee ?? 0) },
    { label: documentVisa === 'd4-1' ? 'Học phí hệ tiếng (4 kỳ)' : 'Học phí kỳ đầu', payer: 'Nộp cho trường', value: documentCosts.tuitionVnd ?? 0 },
  ];

  useEffect(() => {
    const previousTitle = document.title;
    const existingDescription = document.querySelector('meta[name="description"]');
    const previousDescription = existingDescription?.getAttribute('content');
    const meta = existingDescription ?? document.createElement('meta');
    if (!existingDescription) {
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    document.title = 'Du học Hàn Quốc: chi phí rõ từng khoản | Thầy Tư';
    meta.setAttribute('content', 'Tìm hiểu chi phí du học Hàn Quốc: khoản trung tâm thu, khoản học viên tự nộp và học phí trường. Nhận bảng chi phí chi tiết theo trường quan tâm.');
    return () => {
      document.title = previousTitle;
      if (existingDescription && previousDescription !== null && previousDescription !== undefined) {
        meta.setAttribute('content', previousDescription);
      } else if (!existingDescription) {
        meta.remove();
      }
    };
  }, []);

  const submitLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const cleanPhone = pdfPhone.replace(/[\s.-]/g, '').trim();
    if (!phonePattern.test(cleanPhone)) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    if (!pdfConsent) {
      toast.error('Vui lòng đồng ý để chúng tôi liên hệ');
      return;
    }

    const classification = `Nhận hồ sơ chi phí ${documentUniversity?.name ?? ''} qua Zalo · Quan tâm ưu đãi hôm nay`;
    const registration = {
      name: '',
      phone: cleanPhone,
      visaType: documentVisa,
      topikLevel: '',
      universityId: documentUniversity?.id ?? '',
      gpaThpt: '',
      gpaUni: '',
      createdAt: new Date().toISOString(),
      universityName: documentUniversity?.name ?? '',
      costsTotal: documentCosts.total,
      type: 'dang_ky',
      leadSource: 'du-hoc-han-quoc',
      leadIntent: 'school_profile',
      budgetRange: '',
      koreanLanguageOption: '',
      promotionInterest: 'Ưu đãi hôm nay',
    };

    setSubmitting(true);
    try {
      const [{ addDoc, collection }, { db }] = await Promise.all([import('firebase/firestore'), import('../firebasePublic')]);
      await addDoc(collection(db, 'registrations'), registration);
      fetch(GOOGLE_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registration,
          classification,
          phanLoai: classification,
          typeLabel: classification,
        }),
      }).catch((error) => console.error('Google Sheets error:', error));
      (window as Window & { fbq?: (...args: unknown[]) => void }).fbq?.('track', 'Lead', {
        content_name: documentUniversity?.name ?? 'Trang du học Hàn Quốc',
      });
      sessionStorage.setItem('thankYouRequest', JSON.stringify({
        universityName: registration.universityName,
        isSuggestion: false,
      }));
      window.location.assign('/thank-you');
    } catch (error) {
      console.error('Overview lead error:', error);
      toast.error('Chưa gửi được yêu cầu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overview-page">
      <header className="overview-nav">
        <div className="overview-wrap overview-nav-inner">
          <Link className="overview-brand" to="/"><img src="/images/brand-logo.png" alt="" width="46" height="46" /><span>DU HỌC THẦY TƯ</span></Link>
          <nav className={menuOpen ? 'overview-links overview-links-open' : 'overview-links'} aria-label="Điều hướng trang">
            <a href="#lo-trinh" onClick={() => setMenuOpen(false)}>Lộ trình</a>
            <a href="#chi-phi" onClick={() => setMenuOpen(false)}>Chi phí</a>
            <a href="#truong-hoc" onClick={() => setMenuOpen(false)}>Trường học</a>
            <a className="overview-nav-cta" href="#nhan-pdf" onClick={() => setMenuOpen(false)}>Tự xem báo giá <ArrowUpRight size={15} /></a>
          </nav>
          <button className="overview-menu" type="button" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>

      <main>
        <section className="overview-hero" aria-labelledby="overview-title">
          <div className="overview-hero-copy">
            <span className="overview-eyebrow">DU HỌC HÀN QUỐC</span>
            <h1 id="overview-title">Xem trước chi phí.<br /><span>Rồi hãy quyết định.</span></h1>
            <p>Chọn trường và hệ học để xem các khoản dự tính. Biết khoản nào nộp cho trung tâm, khoản nào tự thanh toán. <strong className="overview-hero-highlight">Chọn trường → Chọn hệ du học → Nhận bản báo giá</strong></p>
            <div className="overview-hero-actions"><a className="overview-primary" href="#nhan-pdf">Xem thử chi phí theo trường <ArrowUpRight size={18} /></a><a className="overview-underlink" href="#chi-phi">Các khoản chi gồm gì?</a></div>
          </div>
          <div className="overview-hero-photo"><picture><source media="(max-width: 700px)" srcSet="/images/marketing/hero-san-bay-640.webp" /><img src="/images/marketing/hero-san-bay-1280.webp" width="1280" height="853" alt="Học viên Thầy Tư và gia đình tại sân bay trước chuyến đi Hàn Quốc" fetchPriority="high" /></picture><div className="overview-photo-label">HỌC VIÊN THẦY TƯ TẠI SÂN BAY</div><span className="overview-vertical">TIẾNG HÀN · DU HỌC THẦY TƯ</span></div>
        </section>

        <section id="nhan-pdf" className="overview-pdf overview-wrap" aria-labelledby="overview-pdf-title">
          <div className="overview-pdf-heading"><span className="overview-section-tag">01 / XEM BẢN RÚT GỌN</span><h2 id="overview-pdf-title">Chi phí của trường bạn quan tâm.</h2><p>Chọn trường và hệ học để xem trước từng khoản ngay trên trang. Chưa cần nhập số điện thoại.</p><div className="overview-document-points"><span>Trung tâm thu</span><span>Học viên tự nộp</span><span>Nộp cho trường</span></div></div>
          <div className="overview-pdf-form">
            {schoolsLoading && <p role="status">Đang tải danh sách trường...</p>}{schoolsError && <p role="alert">Không tải được danh sách trường. <button type="button" onClick={retrySchools}>Thử lại</button></p>}
            <SchoolPicker id="overview-document-school" label="TRƯỜNG MUỐN XEM" loading={schoolsLoading} error={schoolsError} onRetry={retrySchools} onOpen={() => setLoadSchoolData(true)} value={documentSchool} universities={sortedUniversities} onChange={(id) => { setDocumentSchool(id); setDocumentPreviewOpen(false); }} />
            <div className="overview-featured-schools" aria-label="Gợi ý trường nổi bật"><span>Gợi ý nhanh</span>{featuredSchools.map(({ id, label }) => <button key={id} type="button" aria-pressed={documentSchool === id} disabled={!universities.some((university) => university.id === id)} onClick={() => { setDocumentSchool(id); setDocumentPreviewOpen(false); }}>{label}</button>)}</div>
            <label htmlFor="overview-document-visa">HỆ HỌC</label><select id="overview-document-visa" value={documentVisa} onChange={(event) => { setDocumentVisa(event.target.value); setDocumentPreviewOpen(false); }}>{VISA_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
            <button className="overview-preview-button" type="button" disabled={!documentUniversity || schoolsLoading || !!schoolsError} onClick={() => setDocumentPreviewOpen(true)}>Xem chi phí dự tính <ArrowUpRight size={17} /></button><small>Có hơn 100 trường trong danh sách để bạn so sánh.</small>
          </div>
          {documentPreviewOpen && <div className="overview-document-result" aria-live="polite">{documentHasTuition ? <><div className="overview-document-result-head"><span>BẢN XEM TRƯỚC · {documentUniversity?.name.toUpperCase()}</span><h3>Các khoản cần chuẩn bị</h3><p>{VISA_TYPES.find((item) => item.id === documentVisa)?.label}</p></div><div className="overview-document-result-rows">{documentPreviewRows.map((row) => <div className="overview-document-result-row" key={row.label}><div><strong>{row.label}</strong><small>{row.payer}</small></div><b>{formatVnd(row.value)}</b></div>)}</div><div className="overview-document-result-total"><span>TỔNG CHI PHÍ DỰ TÍNH</span><strong>{formatVnd(documentCosts.total)}</strong></div><p className="overview-document-result-note">Chưa gồm ký túc xá, vé máy bay, sinh hoạt và chứng minh tài chính. Dùng mức phí tư vấn và học tiếng đầu tiên trong cấu hình; số liệu có thể thay đổi theo kỳ nhập học và tỷ giá.</p></> : <div className="overview-document-result-empty"><h3>Hệ học này chưa có học phí trong dữ liệu.</h3><p>Chọn hệ khác để xem trước, hoặc xem danh sách trường tại trang bóc tách.</p></div>}</div>}
          {documentPreviewOpen && documentHasTuition && <form className="overview-document-lead" onSubmit={(event) => submitLead(event)}>
            <span className="overview-section-tag">02 / NHẬN BẢN ĐẦY ĐỦ QUA ZALO</span>
            <h3>Nhận PDF chi tiết của {documentUniversity?.name} qua Zalo</h3>
            <p>Gồm học phí, nơi nộp từng khoản, mốc thanh toán và thông tin tuyển sinh. Đội ngũ chuẩn bị tài liệu theo phương án bạn đã chọn.</p>
            <label htmlFor="overview-pdf-phone">SỐ ZALO CỦA BẠN</label>
            <input id="overview-pdf-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" value={pdfPhone} onChange={(event) => setPdfPhone(event.target.value)} required />
            <button type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Nhận PDF chi tiết qua Zalo'} <ArrowUpRight size={17} /></button>
            <label className="overview-consent"><input type="checkbox" checked={pdfConsent} onChange={(event) => setPdfConsent(event.target.checked)} required /><span>Tôi đồng ý để Thầy Tư dùng số này gửi tài liệu và liên hệ về yêu cầu của tôi.</span></label>
          </form>}
          {documentPreviewOpen && documentHasTuition && <p className="overview-form-privacy">Xem cách chúng tôi sử dụng thông tin của bạn trong <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>.</p>}
          {documentPreviewOpen && documentHasTuition && <aside className="overview-promotion" aria-label="Ưu đãi đăng ký hôm nay">
            <div className="overview-promotion-copy"><span className="overview-section-tag">ƯU ĐÃI HÔM NAY</span><h3>Đăng ký hôm nay để nhận thêm ưu đãi</h3></div>
            <ul className="overview-promotion-featured"><li>Giảm 10% khóa học tiếng Hàn</li><li>Miễn phí 3 tháng phí ký túc xá</li></ul>
            <details className="overview-promotion-more"><summary>Xem đủ 4 ưu đãi</summary><ul><li>Hỗ trợ đi lại tới trung tâm</li><li>Miễn phí khóa học tiếng Hàn online</li></ul><p>Ưu đãi áp dụng trong hôm nay. Đội ngũ sẽ xác nhận điều kiện cụ thể khi tư vấn.</p></details>
          </aside>}
          <figure className="overview-pdf-example" aria-label="Mô phỏng tin nhắn Zalo và các trang trong bảng giá PDF">
            <div className="overview-pdf-example-head"><span>BẢN XEM TRƯỚC</span><p>{documentUniversity ? `Thông tin chi phí và tuyển sinh ${documentUniversity.name}, hệ ${VISA_TYPES.find((item) => item.id === documentVisa)?.label}.` : 'Ví dụ trang chi phí Ajou và cách đội ngũ gửi thông tin qua Zalo.'}</p></div>
            <div className="overview-pdf-example-stage">
              <div className="overview-zalo-chat">
                <div className="overview-zalo-bar"><strong>Zalo</strong><span>MÔ PHỎNG TIN NHẮN</span></div>
                <div className="overview-zalo-contact"><img src="/images/brand-logo.png" alt="" /><div><strong>Du Học Thầy Tư</strong><small>Gửi tài liệu theo yêu cầu của bạn</small></div></div>
                <div className="overview-zalo-body"><div className="overview-zalo-bubble">Chào bạn, Thầy Tư gửi bạn thông tin <strong>{documentUniversity?.name ?? 'trường phù hợp với hệ học của bạn'}</strong>. Từng khoản chi được ghi rõ nơi nộp và thời điểm dự kiến.</div><div className="overview-zalo-file"><span>PDF</span><div><strong>Hồ sơ chi phí theo trường</strong><small>{documentUniversity?.name ?? 'Trường phù hợp'} · {VISA_TYPES.find((item) => item.id === documentVisa)?.label}</small></div></div><p>Bạn có thể nhắn lại nếu cần đội ngũ giải thích khoản chi nào.</p></div>
              </div>
              <div className="overview-pdf-pages" aria-hidden="true"><div className="overview-pdf-sheet overview-pdf-sheet-back"><img src="/images/brand-logo.png" alt="" /><span>DU HỌC THẦY TƯ</span><strong>HỒ SƠ<br />CHI PHÍ DU HỌC</strong><small>Thông tin trường · Học phí · Chi phí hồ sơ</small></div><div className="overview-pdf-sheet overview-pdf-sheet-middle"><img src="/images/brand-logo.png" alt="" /><span>NỘI DUNG TÀI LIỆU</span><strong>{documentUniversity?.name ?? 'Trường bạn quan tâm'}</strong><p>Học phí theo hệ học</p><p>Chi phí nộp cho từng bên</p><p>Điều kiện tuyển sinh</p><p>Mốc thanh toán dự kiến</p></div><div className="overview-pdf-sheet overview-pdf-sheet-front" /></div>
            </div>
            <figcaption>Ảnh Zalo và trang Ajou chỉ minh họa cách trình bày, không phải hồ sơ của trường đã chọn hoặc báo giá cuối cùng. Đội ngũ sẽ chuẩn bị thông tin theo lựa chọn của bạn. <a href="/images/marketing/bang-gia-mau-ajou.png" target="_blank" rel="noopener noreferrer">Xem trang mẫu Ajou <ArrowUpRight size={13} /></a></figcaption>
          </figure>
        </section>

        <section id="lo-trinh" className="overview-intro overview-wrap">
          <div><span className="overview-section-tag">KHÔNG CHỈ MỘT CON SỐ TỔNG</span><h2><span>Biết mình trả tiền</span><span>cho ai, vào dịch vụ gì</span></h2></div>
          <aside><strong>Minh bạch từ đầu</strong><p>Trung tâm chỉ thu phí xử lý hồ sơ, và chi phí học tiếng Hàn (nếu có), các chi phí còn lại như xin tem vàng, tem tím, học phí của trường Hàn Quốc, trung tâm sẽ hướng dẫn các bạn tự thanh toán</p></aside>
        </section>

        <section id="chi-phi" className="overview-costs">
          <div className="overview-wrap">
            <div className="overview-cost-head"><div><span className="overview-section-tag">CẤU TRÚC CHI PHÍ</span><h2>Đây là những khoản bạn cần tính.</h2></div><p>Số tiền thực tế phụ thuộc vào trường, hệ học, trình độ tiếng và lựa chọn cá nhân.</p></div>
            <div className="overview-cost-grid">
              <div className="overview-cost-main">{costGroups.map((item) => <div className="overview-cost-row" key={item.title}><div><h3>{item.title}</h3><p>{item.description}</p></div><span>{item.payer}</span></div>)}</div>
              <div className="overview-cost-aside"><small>ĐIỀU QUAN TRỌNG</small><h3>“Tổng chi phí” không đồng nghĩa <mark>“phí trung tâm”.</mark></h3><p>Chúng tôi tách rõ đơn vị nhận từng khoản, để gia đình biết tiền sẽ được nộp ở đâu.</p><a href="#nhan-pdf"><strong>Tự xem báo giá <ArrowUpRight size={21} /></strong><span>CHỌN TRƯỜNG & HỆ HỌC</span></a></div>
            </div>
            <p className="overview-cost-note">* Mức chi phí cụ thể cần đối chiếu theo trường, hệ học, TOPIK, tỷ giá và thời điểm.</p>
          </div>
        </section>

        <section id="truong-hoc" className="overview-proof overview-wrap"><div className="overview-proof-lead"><div className="overview-proof-number">HƠN 100 TRƯỜNG<span>Để so sánh</span></div><ol className="overview-proof-steps"><li><span>01</span>Chọn trường và hệ học</li><li><span>02</span>Xem từng khoản chi, biết nộp cho ai</li><li><span>03</span>Nhận bảng giá chi tiết qua Zalo</li></ol><a className="overview-proof-action" href="https://zalo.me/0967593548" target="_blank" rel="noopener noreferrer">Liên hệ với chúng tôi <ArrowUpRight size={17} /></a></div><div><p><strong>Không cần đọc 100 bảng giá cùng lúc.</strong> Chọn trường và hệ học để xem trước từng khoản. Nếu cần tài liệu đầy đủ, đội ngũ sẽ gửi bảng chi phí cùng thông tin tuyển sinh qua Zalo.</p><small>Dữ liệu trường, chi phí và điều kiện được cập nhật theo từng kỳ tuyển sinh.</small><Link to="/boc-tach">Xem danh sách trường đang có <ArrowUpRight size={17} /></Link><figure className="overview-proof-photo"><img src="/images/center/airport-960.webp" srcSet="/images/center/airport-480.webp 480w, /images/center/airport-960.webp 960w, /images/center/airport-1440.webp 1440w" sizes="(max-width: 700px) 100vw, 600px" alt="Học viên và gia đình tại sân bay trước chuyến đi Hàn Quốc" loading="lazy" /><figcaption>Học viên và gia đình tại sân bay</figcaption></figure></div></section>

      </main>
      <SiteFooter />
      <aside className="overview-sticky-contact" aria-label="Tư vấn chọn trường miễn phí">
        <div><strong>Chưa biết chọn trường nào?</strong><span>Liên hệ với chúng tôi để tư vấn hồ sơ miễn phí.</span></div>
        <a href="https://zalo.me/0967593548" target="_blank" rel="noopener noreferrer" aria-label="Liên hệ Zalo 0967593548 để tư vấn hồ sơ miễn phí">Nhắn Zalo <ArrowUpRight size={17} /></a>
      </aside>
      <Toaster position="top-right" />
    </div>
  );
}
