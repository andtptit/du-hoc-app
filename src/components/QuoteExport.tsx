import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { useCosts } from '../hooks/useCosts';
import { VISA_TYPES } from '../data';
import type { Selections } from '../types';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import './quote-export.css';

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} đ`;

export default function QuoteExport() {
  const { universities, globalConfig } = useFirestore();
  const [schoolId, setSchoolId] = useState('');
  const [visaId, setVisaId] = useState('d4-1');
  const [topik, setTopik] = useState('0');
  const [languageIndex, setLanguageIndex] = useState(0);
  const [consultingIndex, setConsultingIndex] = useState(0);
  const [scholarshipPercent, setScholarshipPercent] = useState(0);
  const [dormIndex, setDormIndex] = useState(0);
  const [flightIndex, setFlightIndex] = useState(0);

  const schools = useMemo(() => [...universities].sort((a, b) => a.name.localeCompare(b.name, 'vi')), [universities]);
  const school = schools.find((item) => item.id === schoolId);
  const visa = VISA_TYPES.find((item) => item.id === visaId) ?? VISA_TYPES[0];
  const selections: Selections = useMemo(() => ({
    consultingIdx: consultingIndex,
    koreanLangIdx: languageIndex,
    dormVnMonths: 0,
    dormKrIdx: dormIndex,
    flightIdx: flightIndex,
    scholarshipPercent,
  }), [consultingIndex, languageIndex, dormIndex, flightIndex, scholarshipPercent]);
  const costs = useCosts({ selectedUni: school, visaTypeId: visaId, topikLevelId: topik, exchangeRate: globalConfig.exchangeRate, globalConfig, selections });
  const tuitionField = visa.field as keyof NonNullable<typeof school>;
  const hasTuition = !!school && Number(school[tuitionField]) > 0;
  const feeRows = [
    { label: 'Học tiếng Hàn tại trung tâm', receiver: 'Trung tâm thu', value: costs.koreanLangCost ?? 0 },
    { label: 'Phí tư vấn hồ sơ', receiver: 'Trung tâm thu', value: costs.consultingFee ?? 0 },
    { label: 'Chi phí bên thứ ba', receiver: 'Trung tâm thu hộ', value: costs.thirdPartyFee ?? 0 },
    { label: 'Phí xét tuyển trường', receiver: 'Nộp cho trường', value: costs.applicationFee ?? 0 },
    { label: 'Phí nhập học', receiver: 'Nộp cho trường', value: costs.enrollmentFee ?? 0 },
    { label: visaId === 'd4-1' ? 'Học phí trường · 4 kỳ' : 'Học phí trường · 1 kỳ', receiver: 'Nộp cho trường', value: costs.tuitionVnd ?? 0 },
    ...(scholarshipPercent > 0 ? [{ label: `Học bổng dự kiến · ${scholarshipPercent}%`, receiver: 'Giảm học phí trường', value: -(costs.scholarshipAmount ?? 0) }] : []),
    ...(dormIndex > 0 ? [{ label: 'Ký túc xá / chỗ ở tại Hàn Quốc', receiver: 'Theo lựa chọn', value: costs.dormKrCost ?? 0 }] : []),
    ...(flightIndex > 0 ? [{ label: 'Vé máy bay một chiều', receiver: 'Theo lựa chọn', value: costs.flightCost ?? 0 }] : []),
  ];
  const centerTotal = (costs.koreanLangCost ?? 0) + (costs.consultingFee ?? 0);
  const thirdPartyTotal = costs.thirdPartyFee ?? 0;
  const schoolAndOptionsTotal = costs.total - centerTotal - thirdPartyTotal;
  const languageOption = globalConfig.koreanLanguageOptions[languageIndex];
  const languageLabel = typeof languageOption === 'object' ? languageOption?.label : languageIndex === 0 ? 'Tự học' : `Gói ${languageIndex + 1}`;

  return <div className="quote-export">
    <div className="quote-export-toolbar">
      <div><span>CÔNG CỤ NỘI BỘ</span><h1>Xuất báo giá cho khách</h1><p>Chọn phương án, kiểm tra bản xem trước rồi chọn “Lưu PDF” trong hộp thoại in.</p></div>
      <button type="button" onClick={() => window.print()} disabled={!school || !hasTuition}><Printer size={18} /> Lưu PDF</button>
    </div>

    <div className="quote-export-layout">
      <form className="quote-export-controls" onSubmit={(event) => event.preventDefault()}>
        <label>Trường học<select value={schoolId} onChange={(event) => setSchoolId(event.target.value)}><option value="">Chọn trường</option>{schools.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Hệ học<select value={visaId} onChange={(event) => setVisaId(event.target.value)}>{VISA_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>TOPIK<select value={topik} onChange={(event) => setTopik(event.target.value)}>{Array.from({ length: 7 }, (_, level) => <option key={level} value={level}>{level === 0 ? 'Chưa có chứng chỉ' : `TOPIK ${level}`}</option>)}</select></label>
        <label>Học tiếng tại trung tâm<select value={languageIndex} onChange={(event) => setLanguageIndex(Number(event.target.value))}>{globalConfig.koreanLanguageOptions.map((item, index) => <option key={index} value={index}>{typeof item === 'object' ? item.label : money(item)}</option>)}</select></label>
        <label>Phí tư vấn hồ sơ<select value={consultingIndex} onChange={(event) => setConsultingIndex(Number(event.target.value))}>{globalConfig.consultingOptions.map((item, index) => <option key={index} value={index}>{money(item)}</option>)}</select></label>
        <label>Học bổng dự kiến<select value={scholarshipPercent} onChange={(event) => setScholarshipPercent(Number(event.target.value))}>{[0, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => <option key={value} value={value}>{value}%</option>)}</select></label>
        <label>Chỗ ở Hàn Quốc<select value={dormIndex} onChange={(event) => setDormIndex(Number(event.target.value))}>{costs.parsedDormOptions.map((item, index) => <option key={index} value={index}>{item.label}</option>)}</select></label>
        <label>Vé máy bay<select value={flightIndex} onChange={(event) => setFlightIndex(Number(event.target.value))}>{(costs.flightOptions ?? []).map((item, index) => <option key={index} value={index}>{item === 0 ? 'Chưa tính' : money(item)}</option>)}</select></label>
        <p>TOPIK để tham khảo điều kiện. Học bổng chỉ tính khi bạn chủ động chọn và cần xác minh với trường.</p>
      </form>

      <div className="quote-export-paper">
        {!school ? <div className="quote-export-empty">Chọn một trường để xem bản báo giá.</div> : !hasTuition ? <div className="quote-export-empty">Chưa có học phí cho hệ này. Hãy chọn hệ khác hoặc cập nhật dữ liệu trước khi xuất.</div> : <>
          <header className="quote-document-header"><div className="quote-document-brand"><strong>DU HỌC THẦY TƯ</strong><span>RÕ TỪNG KHOẢN · RÕ NƠI THANH TOÁN</span></div><span>BẢNG CHI PHÍ THAM KHẢO</span></header>
          <div className="quote-document-title"><p>PHƯƠNG ÁN DU HỌC HÀN QUỐC</p><h2>{school.name}</h2><div>{visa.label} <span>·</span> {topik === '0' ? 'Chưa có TOPIK' : `TOPIK ${topik}`}</div></div>
          <div className="quote-document-meta"><span>Ngày lập: {new Intl.DateTimeFormat('vi-VN').format(new Date())}</span><span>Tỷ giá tham khảo: {money(globalConfig.exchangeRate)} / KRW</span><span>Học tiếng: {languageLabel}</span></div>
          <table className="quote-document-table"><thead><tr><th>Khoản chi</th><th>Đơn vị nhận tiền</th><th>Chi phí dự tính</th></tr></thead><tbody>{feeRows.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.receiver}</td><td>{row.value < 0 ? `−${money(-row.value)}` : money(row.value)}</td></tr>)}</tbody></table>
          <div className="quote-document-totals"><div><span>Chi phí của trung tâm</span><strong>{money(centerTotal)}</strong></div><div><span>Trung tâm thu hộ bên thứ ba</span><strong>{money(thirdPartyTotal)}</strong></div><div><span>Trường và khoản theo lựa chọn</span><strong>{money(schoolAndOptionsTotal)}</strong></div><div className="quote-document-grand"><span>TỔNG CHI PHÍ DỰ TÍNH</span><strong>{money(costs.total)}</strong></div></div>
          <section className="quote-document-notes"><h3>Lưu ý trước khi quyết định</h3><ul><li>Bảng giá chỉ mang tính tham khảo, giúp bạn hình dung chi phí cần chuẩn bị. Để hiểu rõ hơn, hãy liên hệ fanpage Du Học Thầy Tư hoặc Zalo <strong>096 759 35 48</strong> để được tư vấn trực tiếp.</li><li>Chi phí của trung tâm gồm phí tư vấn hồ sơ và học tiếng Hàn (nếu chọn). Phí bên thứ ba do trung tâm thu hộ; học phí được nộp cho trường. Các khoản theo lựa chọn được xác nhận khi tư vấn.</li><li>Học phí, điều kiện tuyển sinh và học bổng cần xác nhận theo thông báo của trường ở kỳ nhập học thực tế.</li><li>Chi phí sinh hoạt, chứng minh tài chính và các khoản chưa chọn trong bảng chưa được tính vào tổng.</li></ul></section>
          <footer className="quote-document-footer"><div><strong>DU HỌC THẦY TƯ</strong><p>Số 79 Đường Ngụy Như Kon Tum, Phường Thanh Xuân, Thành phố Hà Nội, Việt Nam</p><p>Hotline / Zalo: 0967 593 548 · contact@tbtgroup.com.vn</p></div><p>Các mốc chi phí và tỷ lệ visa phụ thuộc vào kết quả xét duyệt thực tế của Cục Xuất nhập cảnh Hàn Quốc và chính sách từng kỳ của nhà trường.</p></footer>
        </>}
      </div>
    </div>
  </div>;
}
