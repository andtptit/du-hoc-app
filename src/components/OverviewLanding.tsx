import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { db } from '../firebase';
import { useFirestore } from '../hooks/useFirestore';
import { useCosts } from '../hooks/useCosts';
import { VISA_TYPES } from '../data';
import type { Selections } from '../types';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import '@fontsource/be-vietnam-pro/900.css';
import './overview-landing.css';

const GOOGLE_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby2KObaL-ev4jBf1TqZBWli2H4y1aitQyaCCnMG_KWTRD3B6KEttx5JHqng6dHn3i17/exec';
const formatVnd = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} ₫`;
const phonePattern = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;
type LeadKind = 'pdf_all' | 'quote_pdf';

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
  const { universities, globalConfig } = useFirestore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pdfPhone, setPdfPhone] = useState('');
  const [pdfConsent, setPdfConsent] = useState(false);
  const [pdfSubmitted, setPdfSubmitted] = useState(false);
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteConsent, setQuoteConsent] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteIntent, setQuoteIntent] = useState<LeadKind | null>(null);
  const [school, setSchool] = useState('');
  const [visaType, setVisaType] = useState('d4-1');
  const [topik, setTopik] = useState('0');
  const [languageIndex, setLanguageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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
  const selections: Selections = useMemo(() => ({ consultingIdx: 0, koreanLangIdx: languageIndex, dormVnMonths: 0, dormKrIdx: 0, flightIdx: 0, scholarshipPercent: 0 }), [languageIndex]);
  const costs = useCosts({ selectedUni: selectedUniversity, visaTypeId: visaType, topikLevelId: topik, exchangeRate: globalConfig.exchangeRate, globalConfig, selections });
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
    const cleanPhone = (kind === 'pdf_all' ? pdfPhone : quotePhone).replace(/[\s.-]/g, '').trim();
    if (!phonePattern.test(cleanPhone)) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    if (!(kind === 'pdf_all' ? pdfConsent : quoteConsent)) {
      toast.error('Vui lòng đồng ý để chúng tôi liên hệ');
      return;
    }

    const classification = kind === 'pdf_all' ? 'Nhận PDF bảng giá 100+ trường qua Zalo' : 'Nhận PDF báo giá đã xem qua Zalo';
    const registration = {
      name: '',
      phone: cleanPhone,
      visaType: kind === 'pdf_all' ? '' : visaType,
      topikLevel: kind === 'pdf_all' ? '' : topik,
      universityId: kind === 'pdf_all' ? '' : selectedUniversity?.id ?? '',
      gpaThpt: '',
      gpaUni: '',
      createdAt: new Date().toISOString(),
      universityName: kind === 'pdf_all' ? '' : selectedUniversity?.name ?? '',
      costsTotal: kind === 'pdf_all' ? 0 : costs.total,
      type: 'dang_ky',
      leadSource: 'du-hoc-han-quoc',
      leadIntent: kind,
      koreanLanguageOption: kind === 'pdf_all' ? '' : languageOptions[languageIndex]?.label ?? '',
    };

    setSubmitting(true);
    try {
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
        content_name: kind === 'pdf_all' ? 'PDF 100+ trường' : selectedUniversity?.name ?? 'Trang du học Hàn Quốc',
      });
      if (kind === 'pdf_all') { setPdfSubmitted(true); setPdfPhone(''); setPdfConsent(false); }
      else { setQuoteSubmitted(true); setQuotePhone(''); setQuoteConsent(false); }
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
            <h1 id="overview-title">Minh Bạch<br />toàn bộ chi phí<br /><span>DU HỌC</span></h1>
            <p>Chúng tôi sẽ gửi đến cho bạn toàn bộ chi phí minh bạch từ lúc nhập học, đến khi đặt chân sang Hàn Quốc, để bạn nắm rõ toàn bộ lộ trình. Không phát sinh chi phí ẩn, tất cả khoản phí đều được công khai.</p>
            <div className="overview-hero-actions"><a className="overview-primary" href="#nhan-pdf">Nhận bảng giá qua Zalo <ArrowUpRight size={18} /></a><a className="overview-underlink" href="#xem-bao-gia">Tự xem báo giá</a></div>
          </div>
          <div className="overview-hero-photo"><img src="/images/local/san bay 2.jpg" alt="Học viên Thầy Tư và gia đình tại sân bay trước chuyến đi Hàn Quốc" fetchPriority="high" /><div className="overview-photo-label">HỌC VIÊN THẦY TƯ TẠI SÂN BAY</div><span className="overview-vertical">TIẾNG HÀN · DU HỌC THẦY TƯ</span></div>
        </section>

        <section id="nhan-pdf" className="overview-pdf overview-wrap" aria-labelledby="overview-pdf-title">
          <div className="overview-pdf-heading"><span className="overview-section-tag">01 / NHẬN TÀI LIỆU QUA ZALO</span><h2 id="overview-pdf-title">Bảng giá hơn 100 trường,<br />để bạn tự so sánh.</h2><p>Gồm học phí theo hệ học, phí trung tâm thu và những khoản học viên tự nộp. Phù hợp khi bạn chưa chọn trường.</p></div>
          <form className="overview-pdf-form" onSubmit={(event) => submitLead(event, 'pdf_all')}>
            {pdfSubmitted ? <div className="overview-pdf-success" role="status"><strong>Đã nhận yêu cầu.</strong><p>Đội ngũ sẽ gửi bảng giá qua Zalo theo số bạn cung cấp.</p><button type="button" onClick={() => setPdfSubmitted(false)}>Gửi yêu cầu khác</button></div> : <><label htmlFor="overview-pdf-phone">SỐ ZALO NHẬN BẢNG GIÁ</label><div className="overview-pdf-input"><input id="overview-pdf-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" value={pdfPhone} onChange={(event) => setPdfPhone(event.target.value)} required /><button type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Yêu cầu gửi PDF qua Zalo'} <ArrowUpRight size={17} /></button></div><label className="overview-consent"><input type="checkbox" checked={pdfConsent} onChange={(event) => setPdfConsent(event.target.checked)} required /><span>Tôi đồng ý để Thầy Tư dùng số này gửi tài liệu và liên hệ về yêu cầu của tôi.</span></label><small>Đội ngũ gửi tài liệu qua Zalo sau khi nhận yêu cầu. Không cần chọn trường ở bước này.</small></>}
          </form>
          <figure className="overview-pdf-example" aria-label="Mô phỏng tin nhắn Zalo và các trang trong bảng giá PDF">
            <div className="overview-pdf-example-head"><span>TRONG TÀI LIỆU BẠN SẼ NHẬN</span><p>Tin nhắn Zalo kèm PDF bóc tách chi phí theo trường.</p></div>
            <div className="overview-pdf-example-stage">
              <div className="overview-zalo-chat">
                <div className="overview-zalo-bar"><strong>Zalo</strong><span>MÔ PHỎNG TIN NHẮN</span></div>
                <div className="overview-zalo-contact"><img src="/images/brand-logo.png" alt="" /><div><strong>Du Học Thầy Tư</strong><small>Gửi tài liệu theo yêu cầu của bạn</small></div></div>
                <div className="overview-zalo-body"><div className="overview-zalo-bubble">Chào bạn, Thầy Tư gửi bạn <strong>bảng giá du học Hàn Quốc</strong> để tham khảo. Trong file có học phí theo trường và từng khoản phí được ghi rõ nơi nộp.</div><div className="overview-zalo-file"><span>PDF</span><div><strong>Bang-gia-du-hoc-Han-Quoc.pdf</strong><small>Bảng giá và thông tin trường</small></div></div><p>Bạn có thể so sánh các phương án và nhắn lại nếu cần đội ngũ giải thích khoản chi nào.</p></div>
              </div>
              <div className="overview-pdf-pages" aria-hidden="true"><div className="overview-pdf-sheet overview-pdf-sheet-back"><img src="/images/brand-logo.png" alt="" /><span>DU HỌC THẦY TƯ</span><strong>BẢNG GIÁ<br />DU HỌC HÀN QUỐC</strong><small>Thông tin trường · Học phí · Chi phí hồ sơ</small></div><div className="overview-pdf-sheet overview-pdf-sheet-middle"><img src="/images/brand-logo.png" alt="" /><span>DANH MỤC TRƯỜNG</span><strong>Hơn 100 trường<br />để bạn so sánh.</strong><p>Đại học Ajou</p><p>Đại học Sejong</p><p>Đại học Konkuk</p><p>Đại học Inha</p></div><div className="overview-pdf-sheet overview-pdf-sheet-front" /></div>
            </div>
            <figcaption>Ảnh mô phỏng cách nhận tài liệu. Trang Ajou là bản xem trước với số liệu minh họa, không phải báo giá cuối cùng. <a href="/images/marketing/bang-gia-mau-ajou.png" target="_blank" rel="noopener noreferrer">Xem trang mẫu ở cỡ đầy đủ <ArrowUpRight size={13} /></a></figcaption>
          </figure>
        </section>

        <section id="lo-trinh" className="overview-intro overview-wrap">
          <div><span className="overview-section-tag">KHÔNG CHỈ MỘT CON SỐ TỔNG</span><h2>Biết mình trả tiền cho ai, vào dịch vụ gì</h2></div>
          <aside><strong>Minh bạch từ đầu</strong><p>Trung tâm chỉ thu phí xử lý hồ sơ, và chi phí học tiếng Hàn (nếu có), các chi phí còn lại như xin tem vàng, tem tím, học phí của trường Hàn Quốc, trung tâm sẽ hướng dẫn các bạn tự thanh toán</p></aside>
        </section>

        <section id="chi-phi" className="overview-costs">
          <div className="overview-wrap">
            <div className="overview-cost-head"><div><span className="overview-section-tag">CẤU TRÚC CHI PHÍ</span><h2>Đây là những khoản bạn cần tính.</h2></div><p>Số tiền thực tế phụ thuộc vào trường, hệ học, trình độ tiếng và lựa chọn cá nhân.</p></div>
            <div className="overview-cost-grid">
              <div className="overview-cost-main">{costGroups.map((item) => <div className="overview-cost-row" key={item.title}><div><h3>{item.title}</h3><p>{item.description}</p></div><span>{item.payer}</span></div>)}</div>
              <div className="overview-cost-aside"><small>ĐIỀU QUAN TRỌNG</small><h3>“Tổng chi phí” không đồng nghĩa “phí trung tâm”.</h3><p>Chúng tôi tách rõ đơn vị nhận từng khoản, để gia đình biết tiền sẽ được nộp ở đâu.</p><a href="#xem-bao-gia"><strong>Tự xem báo giá <ArrowUpRight size={21} /></strong><span>CHỌN TRƯỜNG, HỆ HỌC & TOPIK</span></a></div>
            </div>
            <p className="overview-cost-note">* Mức chi phí cụ thể cần đối chiếu theo trường, hệ học, TOPIK, tỷ giá và thời điểm.</p>
          </div>
        </section>

        <section id="xem-bao-gia" className="overview-quote overview-wrap" aria-labelledby="overview-quote-title">
          <div className="overview-quote-head"><div><span className="overview-section-tag">02 / TỰ XEM BÁO GIÁ CHI TIẾT</span><h2 id="overview-quote-title">Chi phí theo lựa chọn của bạn.</h2></div><p>Chọn trường, hệ học và TOPIK. Xem các khoản ngay trên trang, chưa cần để lại số điện thoại.</p></div>
          <div className="overview-quote-grid">
            <div className="overview-quote-options"><h3>Thông tin dự kiến</h3><p>Bạn có thể đổi lựa chọn để so sánh.</p><label htmlFor="overview-quote-school">TRƯỜNG DỰ KIẾN</label><select id="overview-quote-school" value={school} onChange={(event) => { setSchool(event.target.value); setQuoteIntent(null); setQuoteSubmitted(false); }}><option value="">Chọn một trường</option>{sortedUniversities.map((university) => <option key={university.id} value={university.id}>{university.name}</option>)}</select><label htmlFor="overview-quote-visa">HỆ HỌC</label><select id="overview-quote-visa" value={visaType} onChange={(event) => { setVisaType(event.target.value); setQuoteIntent(null); setQuoteSubmitted(false); }}>{VISA_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><label htmlFor="overview-quote-topik">TRÌNH ĐỘ TOPIK</label><select id="overview-quote-topik" value={topik} onChange={(event) => { setTopik(event.target.value); setQuoteIntent(null); setQuoteSubmitted(false); }}><option value="0">Chưa có chứng chỉ</option><option value="1">TOPIK 1</option><option value="2">TOPIK 2</option><option value="3">TOPIK 3</option><option value="4">TOPIK 4</option><option value="5">TOPIK 5</option><option value="6">TOPIK 6</option></select><label htmlFor="overview-quote-language">HỌC TIẾNG TẠI TRUNG TÂM</label><select id="overview-quote-language" value={languageIndex} onChange={(event) => { setLanguageIndex(Number(event.target.value)); setQuoteIntent(null); setQuoteSubmitted(false); }}>{languageOptions.map((item, index) => <option key={`${item.label}-${index}`} value={index}>{item.label}</option>)}</select><small>TOPIK được lưu để tư vấn điều kiện và học bổng; bảng dự tính này chưa tự trừ học bổng.</small></div>
            <div className="overview-quote-preview" aria-live="polite">{!selectedUniversity ? <div className="overview-quote-empty"><span>↗</span><h3>Chọn trường để bắt đầu.</h3><p>Bảng chi phí chi tiết sẽ xuất hiện ở đây ngay sau khi bạn chọn trường.</p></div> : !hasTuition ? <div className="overview-quote-empty"><h3>Trường này chưa có học phí cho hệ đã chọn.</h3><p>Hãy chọn hệ khác hoặc yêu cầu đội ngũ kiểm tra bảng giá mới nhất.</p></div> : <><div className="overview-quote-preview-head"><div><span>BÁO GIÁ DỰ TÍNH · {selectedUniversity.name.toUpperCase()}</span><h3>{VISA_TYPES.find((item) => item.id === visaType)?.label}</h3><p>Đã tách theo nơi nhận tiền · Tỷ giá: {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(globalConfig.exchangeRate)} ₫/KRW</p></div><strong>CHI PHÍ THAM KHẢO</strong></div><div className="overview-quote-rows">{quoteRows.map((row) => <div className="overview-quote-row" key={row.label}><b>{row.label}</b><span>{row.payer}</span><strong>{formatVnd(row.value)}</strong></div>)}</div><div className="overview-quote-total"><span>TỔNG CHI PHÍ DỰ TÍNH</span><strong>{formatVnd(costs.total)}</strong></div><p className="overview-quote-note">Chưa gồm ký túc xá, vé máy bay, sinh hoạt và chứng minh tài chính. Tổng dùng mức phí tư vấn đầu tiên trong cấu hình. Chi phí thực tế có thể thay đổi theo kỳ nhập học, tỷ giá và lựa chọn hồ sơ.</p></>}</div>
          </div>
          <div className="overview-quote-next"><div><h3>Thấy phương án này phù hợp?</h3><p>Xem báo giá không cần số điện thoại. Bạn có thể nhận bản chi tiết qua Zalo hoặc trao đổi trực tiếp về phương án vừa chọn.</p></div><div className="overview-quote-actions"><button type="button" disabled={!selectedUniversity || !hasTuition} onClick={() => { setQuoteIntent('quote_pdf'); setQuoteSubmitted(false); }}>Nhận báo giá này qua Zalo <ArrowUpRight size={17} /></button><a href="https://zalo.me/0967593548" target="_blank" rel="noopener noreferrer">Tư vấn Phương án này <ArrowUpRight size={17} /></a></div></div>
          {quoteIntent && <form className="overview-quote-lead" onSubmit={(event) => submitLead(event, quoteIntent)}>{quoteSubmitted ? <div role="status"><strong>Đã nhận yêu cầu của bạn.</strong><p>Đội ngũ sẽ liên hệ qua Zalo về phương án {selectedUniversity?.name} vừa xem.</p></div> : <><div><strong>{quoteIntent === 'quote_pdf' ? 'Nhận bản báo giá qua Zalo' : 'Nhờ tư vấn về phương án này'}</strong><p>Phương án {selectedUniversity?.name} và các lựa chọn vừa xem sẽ được gửi kèm yêu cầu.</p></div><label htmlFor="overview-quote-phone">SỐ ĐIỆN THOẠI / ZALO</label><input id="overview-quote-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" value={quotePhone} onChange={(event) => setQuotePhone(event.target.value)} required /><label className="overview-consent"><input type="checkbox" checked={quoteConsent} onChange={(event) => setQuoteConsent(event.target.checked)} required /><span>Tôi đồng ý để Thầy Tư liên hệ về phương án này qua số đã cung cấp.</span></label><button type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi yêu cầu'} <ArrowUpRight size={16} /></button></>}</form>}
        </section>

        <section id="truong-hoc" className="overview-proof overview-wrap"><div className="overview-proof-lead"><div className="overview-proof-number">HƠN 100 TRƯỜNG<span>Để so sánh</span></div><ol className="overview-proof-steps"><li><span>01</span>Chọn trường và hệ học</li><li><span>02</span>Xem từng khoản chi, biết nộp cho ai</li><li><span>03</span>Nhận bảng giá chi tiết qua Zalo</li></ol><a className="overview-proof-action" href="#xem-bao-gia">Tự xem báo giá <ArrowUpRight size={17} /></a></div><div><p><strong>Không cần đọc 100 bảng giá cùng lúc.</strong> Chọn trường bạn quan tâm, hoặc cho biết hệ học và ngân sách; đội ngũ sẽ gửi bảng chi phí cùng thông tin tuyển sinh phù hợp để bạn dễ đối chiếu.</p><small>Dữ liệu trường, chi phí và điều kiện được cập nhật theo từng kỳ tuyển sinh.</small><Link to="/boc-tach">Xem danh sách trường đang có <ArrowUpRight size={17} /></Link><figure className="overview-proof-photo"><img src="/images/center/airport-960.webp" srcSet="/images/center/airport-480.webp 480w, /images/center/airport-960.webp 960w, /images/center/airport-1440.webp 1440w" sizes="(max-width: 700px) 100vw, 600px" alt="Học viên và gia đình tại sân bay trước chuyến đi Hàn Quốc" loading="lazy" /><figcaption>Học viên và gia đình tại sân bay</figcaption></figure></div></section>

      </main>
      <footer className="overview-footer"><div className="overview-wrap"><div className="overview-footer-brand"><img src="/images/brand-logo.png" alt="" width="34" height="34" /><strong>TIẾNG HÀN & DU HỌC THẦY TƯ</strong></div><span>Chi phí thực tế phụ thuộc trường và thời điểm.</span></div></footer>
      <Toaster position="top-right" />
    </div>
  );
}
