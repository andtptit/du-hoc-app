import { useMemo } from 'react';
import { University, GlobalConfig, Selections, CostBreakdown } from '../types';
import { VISA_TYPES } from '../data';
import { extractTuitionMin } from '../utils/extract';

/**
 * Parse phí cố định (Apply/Nhập học) theo từng hệ Visa.
 * Hỗ trợ 2 format:
 *   - Số thuần: 2000000  → trả về 2000000 (backward compat)
 *   - Chuỗi đa visa: "D4-1:100000 KRW;D2-2:150000 KRW;D2-3:70000 KRW"
 *     → tìm entry khớp visaId, extract số KRW nhỏ nhất
 *     → nếu không tìm thấy visa → trả về 0 (trường không áp dụng loại phí này)
 */
function parseVisaSpecificCost(
  raw: string | number | undefined,
  visaId: string,
  exchangeRate: number
): number {
  if (raw === undefined || raw === null || raw === '') return 0;
  if (typeof raw === 'number') return raw;

  // Thử parse như số thuần
  const asNumber = Number(raw);
  if (!isNaN(asNumber) && asNumber > 0) return asNumber;

  // Parse chuỗi đa visa, ví dụ: "D4-1:100000 KRW;D2-2:150000 KRW"
  const segments = raw.split(';').map(s => s.trim()).filter(Boolean);
  for (const seg of segments) {
    const colonIdx = seg.indexOf(':');
    if (colonIdx === -1) continue;
    const key = seg.substring(0, colonIdx).trim().toLowerCase().replace(/[\s-]/g, '-');
    const normalizedVisaId = visaId.toLowerCase().replace(/[\s-]/g, '-');
    if (key === normalizedVisaId) {
      const valueStr = seg.substring(colonIdx + 1);
      const extracted = extractTuitionMin(valueStr);
      if (extracted > 0) return extracted * exchangeRate;
      return 0;
    }
  }
  return 0;
}


export interface ParsedDormOption {
  label: string;
  priceKrw: number;
  priceVnd: number;
}

interface UseCostsParams {
  selectedUni: University | undefined;
  visaTypeId: string;
  topikLevelId: string;
  exchangeRate: number;
  globalConfig: GlobalConfig;
  selections: Selections;
}

export function useCosts({
  selectedUni,
  visaTypeId,
  topikLevelId,
  exchangeRate,
  globalConfig,
  selections,
}: UseCostsParams): Partial<CostBreakdown> & { total: number; parsedDormOptions: ParsedDormOption[]; flightOptions: number[] } {
  const selectedVisa = useMemo(
    () => VISA_TYPES.find((v) => v.id === visaTypeId) || VISA_TYPES[2],
    [visaTypeId]
  );

  return useMemo(() => {
    if (!selectedUni || !globalConfig) return { total: 0, parsedDormOptions: [] };

    const visaField = selectedVisa.field as 'calcTuitionD4' | 'calcTuitionD2_1' | 'calcTuitionD2_2' | 'calcTuitionD2_3' | 'calcTuitionD2_3_no_topik' | 'calcTuitionD2_6';

    const opt = globalConfig.koreanLanguageOptions[selections.koreanLangIdx];
    const koreanLangCost = typeof opt === 'object' ? opt.price : (opt || 0);
    const consultingOptions = globalConfig.consultingOptions || [39000000];
    const consultingFee = (consultingOptions[selections.consultingIdx] !== undefined)
      ? consultingOptions[selections.consultingIdx]
      : consultingOptions[0];
    const thirdPartyFee = globalConfig.thirdPartyFee;
    const applicationFee = parseVisaSpecificCost(selectedUni.applicationFee, visaTypeId, exchangeRate);
    const enrollmentFee = parseVisaSpecificCost(selectedUni.enrollmentFee, visaTypeId, exchangeRate);
    // const dormVnCost = selections.dormVnMonths * globalConfig.dormVietnamPricePerMonth;
    const dormVnCost = 0;

    const baseTuitionKrw = selectedUni[visaField] || 0;
    const tuitionTerms = visaTypeId === 'd4-1' ? 4 : 1;
    const tuitionVnd = baseTuitionKrw * exchangeRate * tuitionTerms;
    const scholarshipAmount = tuitionVnd * (selections.scholarshipPercent / 100);
    const finalTuitionVnd = tuitionVnd - scholarshipAmount;

    // Phân tích thông tin Ký túc xá HQ từ `selectedUni.dormitory`
    let parsedDormOptions: ParsedDormOption[] = [];
    if (selectedUni.dormitory) {
      const parts = selectedUni.dormitory.split(';').map(p => p.trim()).filter(Boolean);
      parsedDormOptions = parts.map(part => {
        const krw = extractTuitionMin(part);
        return {
          label: part,
          priceKrw: krw,
          priceVnd: krw * exchangeRate
        };
      });
    }

    // Fallback lại globalConfig nếu trường không có dữ liệu KTX
    if (parsedDormOptions.length === 0) {
      parsedDormOptions = globalConfig.dormKoreaOptions.map(opt => ({
        label: opt.label,
        priceKrw: opt.price / exchangeRate, // Revert from VND to KRW for consistency
        priceVnd: opt.price
      }));
    }

    // Luôn thêm tùy chọn "Không ở KTX" vào đầu danh sách
    const noneDorm: ParsedDormOption = {
      label: 'Tự thuê / Không ở KTX (0đ)',
      priceKrw: 0,
      priceVnd: 0,
    };
    parsedDormOptions = [noneDorm, ...parsedDormOptions];

    const dormKrCost = parsedDormOptions[selections.dormKrIdx]?.priceVnd || 0;

    // Đảm bảo có tùy chọn 0đ cho Vé máy bay
    const flightOpts = globalConfig.flightOptions.includes(0) 
      ? globalConfig.flightOptions 
      : [0, ...globalConfig.flightOptions];
    const flightCost = flightOpts[selections.flightIdx] || 0;

    const total =
      koreanLangCost +
      consultingFee +
      thirdPartyFee +
      applicationFee +
      enrollmentFee +
      dormVnCost +
      finalTuitionVnd +
      dormKrCost +
      flightCost;

    return {
      koreanLangCost,
      consultingFee,
      thirdPartyFee,
      applicationFee,
      enrollmentFee,
      dormVnCost,
      tuitionVnd: finalTuitionVnd,
      scholarshipAmount,
      dormKrCost,
      flightCost,
      total,
      parsedDormOptions,
      flightOptions: flightOpts,
    };
  }, [selectedUni, visaTypeId, topikLevelId, selections, globalConfig, exchangeRate, selectedVisa]);
}
