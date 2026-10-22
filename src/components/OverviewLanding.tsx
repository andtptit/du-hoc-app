import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLandingData } from '../hooks/useLandingData';
import { useCosts } from '../hooks/useCosts';
import SiteFooter from './SiteFooter';
import { VISA_TYPES } from '../data';
import type { Selections } from '../types';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './overview-landing.css';

const GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby2KObaL-ev4jBf1TqZBWli2H4y1aitQyaCCnMG_KWTRD3B6KEttx5JHqng6dHn3i17/exec';
const formatVnd = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} ₫`;
const phonePattern = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;
type LeadKind = 'school_profile' | 'school_suggestions' | 'quote_pdf';

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

export default function OverviewLanding() {
  const [loadSchoolData, setLoadSchoolData] = useState(false);
  const { universities, globalConfig, schoolsLoading, schoolsError, retrySchools } = useLandingData(loadSchoolData);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pdfPhone, setPdfPhone] = useState('');
  const [pdfConsent, setPdfConsent] = useState(false);
  const [documentSchool, setDocumentSchool] = useState('');
  const [documentVisa, setDocumentVisa] = useState('d4-1');
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteConsent, setQuoteConsent] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteIntent, setQuoteIntent] = useState<LeadKind | null>(null);
  const [school, setSchool] = useState('');
  const [visaType, setVisaType] = useState('d4-1');
  const [topik, setTopik] = useState('0');
  const [languageIndex, setLanguageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loadSchoolData) return;
    const startLoading = () => setLoadSchoolData(true);
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startLoading();
    });
    const documentSection = document.getElementById('nhan-pdf');
    const quoteSection = document.getElementById('xem-bao-gia');
    if (documentSection) observer.observe(documentSection);
    if (quoteSection) observer.observe(quoteSection);
    if (window.location.hash || window.scrollY > 0) startLoading();
    return () => observer.disconnect();
  }, [loadSchoolData]);

  const sortedUniversities = useMemo(
    () => [...universities].sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    [universities]
  );
  const languageOptions = useMemo(() => globalConfig.koreanLanguageOptions.map((option, index) => {
    const raw = option as { label?: string; price?: number } | number;
    const price = typeof raw === 'number' ? raw : Number(raw.price) || 0;
    const configuredLabel = typeof raw === 'number' ? '' : raw.label?.trim();
    const label = configuredLabel || (price === 0 ? 'Tự học (0 ₫)' : `Gói học tiếng ${index}: ${formatVnd(price)}`);
    return { label, price };
  }), [globalConfig.koreanLanguageOptions]);
  const selectedUniversity = universities.find((university) => university.id === school);
  const documentUniversity = universities.find((university) => university.id === documentSchool);
  const documentKind: LeadKind = documentSchool ? 'school_profile' : 'school_suggestions';
  const selections: Selections = useMemo(() => ({ consultingIdx: 0, koreanLangIdx: languageIndex, dormVnMonths: 0, dormKrIdx: 0, flightIdx: 0, scholarshipPercent: 0 }), [languageIndex]);
  const costs = useCosts({ selectedUni: selectedUniversity, visaTypeId: visaType, topikLevelId: topik, exchangeRate: globalConfig.exchangeRate, globalConfig, selections });
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
  const visaField = VISA_TYPES.find((item) => item.id === visaType)?.field as keyof NonNullable<typeof selectedUniversity> | undefined;
  const hasTuition = !!(selectedUniversity && visaField && Number(selectedUniversity[visaField]) > 0);
  const quoteRows = [
    { label: 'Học tiếng tại trung tâm', payer: 'Trung tâm thu', value: costs.koreanLangCost ?? 0 },
    { label: 'Tư vấn & xử lý hồ sơ', payer: 'Trung tâm thu', value: costs.consultingFee ?? 0 },
    { label: 'Phí bên thứ ba', payer: 'Học viên tự nộp', value: costs.thirdPartyFee ?? 0 },
    { label: 'Phí xét tuyển & nhập học', payer: 'Nộp cho trường', value: (costs.applicationFee ?? 0) + (costs.enrollmentFee ?? 0) },
    { label: visaType === 'd4-1' ? 'Học phí hệ tiếng (4 kỳ)' : 'Học phí kỳ đầu', payer: 'Nộp cho trường', value: costs.tuitionVnd ?? 0 },
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

  const submitLead = async (event: React.FormEvent<HTMLFormElement>, kind: LeadKind) => {
    event.preventDefault();
    if (submitting) return;
    const cleanPhone = (kind !== 'quote_pdf' ? pdfPhone : quotePhone).replace(/[\s.-]/g, '').trim();
    if (!phonePattern.test(cleanPhone)) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    if (!(kind !== 'quote_pdf' ? pdfConsent : quoteConsent)) {
      toast.error('Vui lòng đồng ý để chúng tôi liên hệ');
      return;
    }

    const classification = kind === 'school_profile' ? `Nhận hồ sơ chi phí ${documentUniversity?.name ?? ''} qua Zalo · Quan tâm ưu đãi hôm nay` : kind === 'school_suggestions' ? 'Nhận gợi ý trường và chi phí qua Zalo' : 'Nhận PDF báo giá đã xem qua Zalo';
    const registration = {
      name: '',
      phone: cleanPhone,
      visaType: kind === 'quote_pdf' ? visaType : documentVisa,
      topikLevel: kind === 'quote_pdf' ? topik : '',
      universityId: kind === 'quote_pdf' ? selectedUniversity?.id ?? '' : documentUniversity?.id ?? '',
      gpaThpt: '',
      gpaUni: '',
      createdAt: new Date().toISOString(),
      universityName: kind === 'quote_pdf' ? selectedUniversity?.name ?? '' : documentUniversity?.name ?? '',
      costsTotal: kind === 'quote_pdf' ? costs.total : kind === 'school_profile' ? documentCosts.total : 0,
      type: 'dang_ky',
      leadSource: 'du-hoc-han-quoc',
      leadIntent: kind,
      budgetRange: '',
      koreanLanguageOption: kind === 'quote_pdf' ? languageOptions[languageIndex]?.label ?? '' : '',
      promotionInterest: kind === 'school_profile' ? 'Ưu đãi hôm nay' : '',
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
        content_name: kind === 'quote_pdf' ? selectedUniversity?.name ?? 'Trang du học Hàn Quốc' : documentUniversity?.name ?? 'Gợi ý trường',
      });
      sessionStorage.setItem('thankYouRequest', JSON.stringify({
        universityName: registration.universityName,
        isSuggestion: kind === 'school_suggestions',
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
            <a className="overview-nav-cta" href="#xem-bao-gia" onClick={() => setMenuOpen(false)}>Tự xem báo giá <ArrowUpRight size={15} /></a>
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
            <label htmlFor="overview-document-school">TRƯỜNG MUỐN XEM</label><select id="overview-document-school" disabled={schoolsLoading || schoolsError} value={documentSchool} onChange={(event) => { setDocumentSchool(event.target.value); setDocumentPreviewOpen(false); }}><option value="">Chọn một trường</option>{sortedUniversities.map((university) => <option key={university.id} value={university.id}>{university.name}</option>)}</select>
            <label htmlFor="overview-document-visa">HỆ HỌC</label><select id="overview-document-visa" value={documentVisa} onChange={(event) => { setDocumentVisa(event.target.value); setDocumentPreviewOpen(false); }}>{VISA_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
            <button className="overview-preview-button" type="button" disabled={!documentUniversity || schoolsLoading || !!schoolsError} onClick={() => setDocumentPreviewOpen(true)}>Xem chi phí dự tính <ArrowUpRight size={17} /></button><small>Có hơn 100 trường trong danh sách để bạn so sánh.</small>
          </div>
          {documentPreviewOpen && <div className="overview-document-result" aria-live="polite">{documentHasTuition ? <><div className="overview-document-result-head"><span>BẢN XEM TRƯỚC · {documentUniversity?.name.toUpperCase()}</span><h3>Các khoản cần chuẩn bị</h3><p>{VISA_TYPES.find((item) => item.id === documentVisa)?.label}</p></div><div className="overview-document-result-rows">{documentPreviewRows.map((row) => <div className="overview-document-result-row" key={row.label}><div><strong>{row.label}</strong><small>{row.payer}</small></div><b>{formatVnd(row.value)}</b></div>)}</div><div className="overview-document-result-total"><span>TỔNG CHI PHÍ DỰ TÍNH</span><strong>{formatVnd(documentCosts.total)}</strong></div><p className="overview-document-result-note">Chưa gồm ký túc xá, vé máy bay, sinh hoạt và chứng minh tài chính. Dùng mức phí tư vấn và học tiếng đầu tiên trong cấu hình; số liệu có thể thay đổi theo kỳ nhập học và tỷ giá.</p></> : <div className="overview-document-result-empty"><h3>Hệ học này chưa có học phí trong dữ liệu.</h3><p>Chọn hệ khác để xem trước, hoặc xem bảng báo giá chi tiết ở mục bên dưới.</p></div>}</div>}
          {documentPreviewOpen && documentHasTuition && <form className="overview-document-lead" onSubmit={(event) => submitLead(event, documentKind)}>
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
              <div className="overview-cost-aside"><small>ĐIỀU QUAN TRỌNG</small><h3>“Tổng chi phí” không đồng nghĩa <mark>“phí trung tâm”.</mark></h3><p>Chúng tôi tách rõ đơn vị nhận từng khoản, để gia đình biết tiền sẽ được nộp ở đâu.</p><a href="#xem-bao-gia"><strong>Tự xem báo giá <ArrowUpRight size={21} /></strong><span>CHỌN TRƯỜNG, HỆ HỌC & TOPIK</span></a></div>
            </div>
            <p className="overview-cost-note">* Mức chi phí cụ thể cần đối chiếu theo trường, hệ học, TOPIK, tỷ giá và thời điểm.</p>
          </div>
        </section>

        <section id="xem-bao-gia" className="overview-quote overview-wrap" aria-labelledby="overview-quote-title">
          <div className="overview-quote-head"><div><span className="overview-section-tag">THỬ THÊM PHƯƠNG ÁN KHÁC</span><h2 id="overview-quote-title">Chi phí theo lựa chọn của bạn.</h2></div><p>Đổi trường, hệ học, TOPIK và lựa chọn học tiếng để so sánh từng khoản. Chưa cần để lại số điện thoại.</p></div>
          {schoolsLoading && <p role="status" style={{ fontSize: 13, color: '#5c6b79' }}>Đang tải danh sách trường...</p>}{schoolsError && <p role="alert">Không tải được danh sách trường. <button type="button" onClick={retrySchools}>Thử lại</button></p>}
          <div className="overview-quote-grid">
            <div className="overview-quote-options"><h3>Thông tin dự kiến</h3><p>Bạn có thể đổi lựa chọn để so sánh.</p><label htmlFor="overview-quote-school">TRƯỜNG DỰ KIẾN</label><select id="overview-quote-school" disabled={schoolsLoading || schoolsError} value={school} onChange={(event) => { setSchool(event.target.value); setQuoteIntent(null); setQuoteSubmitted(false); }}><option value="">Chọn một trường</option>{sortedUniversities.map((university) => <option key={university.id} value={university.id}>{university.name}</option>)}</select><label htmlFor="overview-quote-visa">HỆ HỌC</label><select id="overview-quote-visa" value={visaType} onChange={(event) => { setVisaType(event.target.value); setQuoteIntent(null); setQuoteSubmitted(false); }}>{VISA_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><label htmlFor="overview-quote-topik">TRÌNH ĐỘ TOPIK</label><select id="overview-quote-topik" value={topik} onChange={(event) => { setTopik(event.target.value); setQuoteIntent(null); setQuoteSubmitted(false); }}><option value="0">Chưa có chứng chỉ</option><option value="1">TOPIK 1</option><option value="2">TOPIK 2</option><option value="3">TOPIK 3</option><option value="4">TOPIK 4</option><option value="5">TOPIK 5</option><option value="6">TOPIK 6</option></select><label htmlFor="overview-quote-language">HỌC TIẾNG TẠI TRUNG TÂM</label><select id="overview-quote-language" value={languageIndex} onChange={(event) => { setLanguageIndex(Number(event.target.value)); setQuoteIntent(null); setQuoteSubmitted(false); }}>{languageOptions.map((item, index) => <option key={`${item.label}-${index}`} value={index}>{item.label}</option>)}</select><small>TOPIK được lưu để tư vấn điều kiện và học bổng; bảng dự tính này chưa tự trừ học bổng.</small></div>
            <div className="overview-quote-preview" aria-live="polite">{!selectedUniversity ? <div className="overview-quote-empty"><span>↗</span><h3>Chọn trường để bắt đầu.</h3><p>Bảng chi phí chi tiết sẽ xuất hiện ở đây ngay sau khi bạn chọn trường.</p></div> : !hasTuition ? <div className="overview-quote-empty"><h3>Trường này chưa có học phí cho hệ đã chọn.</h3><p>Hãy chọn hệ khác hoặc yêu cầu đội ngũ kiểm tra bảng giá mới nhất.</p></div> : <><div className="overview-quote-preview-head"><div><span>BÁO GIÁ DỰ TÍNH · {selectedUniversity.name.toUpperCase()}</span><h3>{VISA_TYPES.find((item) => item.id === visaType)?.label}</h3><p>Đã tách theo nơi nhận tiền · Tỷ giá: {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(globalConfig.exchangeRate)} ₫/KRW</p></div><strong>CHI PHÍ THAM KHẢO</strong></div><div className="overview-quote-rows">{quoteRows.map((row) => <div className="overview-quote-row" key={row.label}><b>{row.label}</b><span>{row.payer}</span><strong>{formatVnd(row.value)}</strong></div>)}</div><div className="overview-quote-total"><span>TỔNG CHI PHÍ DỰ TÍNH</span><strong>{formatVnd(costs.total)}</strong></div><p className="overview-quote-note">Chưa gồm ký túc xá, vé máy bay, sinh hoạt và chứng minh tài chính. Tổng dùng mức phí tư vấn đầu tiên trong cấu hình. Chi phí thực tế có thể thay đổi theo kỳ nhập học, tỷ giá và lựa chọn hồ sơ.</p></>}</div>
          </div>
          <div className="overview-quote-next"><div><h3>Thấy phương án này phù hợp?</h3><p>Xem báo giá không cần số điện thoại. Bạn có thể nhận bản chi tiết qua Zalo hoặc trao đổi trực tiếp về phương án vừa chọn.</p></div><div className="overview-quote-actions"><button type="button" disabled={!selectedUniversity || !hasTuition} onClick={() => { setQuoteIntent('quote_pdf'); setQuoteSubmitted(false); }}>Nhận báo giá này qua Zalo <ArrowUpRight size={17} /></button><a href="https://zalo.me/0967593548" target="_blank" rel="noopener noreferrer">Tư vấn Phương án này <ArrowUpRight size={17} /></a></div></div>
          {quoteIntent && <form className="overview-quote-lead" onSubmit={(event) => submitLead(event, quoteIntent)}>{quoteSubmitted ? <div role="status"><strong>Đã nhận yêu cầu của bạn.</strong><p>Đội ngũ sẽ liên hệ qua Zalo về phương án {selectedUniversity?.name} vừa xem.</p></div> : <><div><strong>{quoteIntent === 'quote_pdf' ? 'Nhận bản báo giá qua Zalo' : 'Nhờ tư vấn về phương án này'}</strong><p>Phương án {selectedUniversity?.name} và các lựa chọn vừa xem sẽ được gửi kèm yêu cầu.</p></div><label htmlFor="overview-quote-phone">SỐ ĐIỆN THOẠI / ZALO</label><input id="overview-quote-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" value={quotePhone} onChange={(event) => setQuotePhone(event.target.value)} required /><label className="overview-consent"><input type="checkbox" checked={quoteConsent} onChange={(event) => setQuoteConsent(event.target.checked)} required /><span>Tôi đồng ý để Thầy Tư liên hệ về phương án này qua số đã cung cấp.</span></label><button type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi yêu cầu'} <ArrowUpRight size={16} /></button></>}</form>}
          {quoteIntent && <p className="overview-form-privacy">Xem <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link> trước khi gửi yêu cầu.</p>}
        </section>

        <section id="truong-hoc" className="overview-proof overview-wrap"><div className="overview-proof-lead"><div className="overview-proof-number">HƠN 100 TRƯỜNG<span>Để so sánh</span></div><ol className="overview-proof-steps"><li><span>01</span>Chọn trường và hệ học</li><li><span>02</span>Xem từng khoản chi, biết nộp cho ai</li><li><span>03</span>Nhận bảng giá chi tiết qua Zalo</li></ol><a className="overview-proof-action" href="#xem-bao-gia">Tự xem báo giá <ArrowUpRight size={17} /></a></div><div><p><strong>Không cần đọc 100 bảng giá cùng lúc.</strong> Chọn trường bạn quan tâm, hoặc cho biết hệ học và ngân sách; đội ngũ sẽ gửi bảng chi phí cùng thông tin tuyển sinh phù hợp để bạn dễ đối chiếu.</p><small>Dữ liệu trường, chi phí và điều kiện được cập nhật theo từng kỳ tuyển sinh.</small><Link to="/boc-tach">Xem danh sách trường đang có <ArrowUpRight size={17} /></Link><figure className="overview-proof-photo"><img src="/images/center/airport-960.webp" srcSet="/images/center/airport-480.webp 480w, /images/center/airport-960.webp 960w, /images/center/airport-1440.webp 1440w" sizes="(max-width: 700px) 100vw, 600px" alt="Học viên và gia đình tại sân bay trước chuyến đi Hàn Quốc" loading="lazy" /><figcaption>Học viên và gia đình tại sân bay</figcaption></figure></div></section>

      </main>
      <SiteFooter />
      <Toaster position="top-right" />
    </div>
  );
}
