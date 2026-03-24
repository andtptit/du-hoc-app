import { useMemo } from 'react';
import { University, GlobalConfig, Selections, CostBreakdown } from '../types';
import { VISA_TYPES } from '../data';
import { extractTuitionMin } from '../utils/extract';

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
}: UseCostsParams): Partial<CostBreakdown> & { total: number; parsedDormOptions: ParsedDormOption[] } {
  const selectedVisa = useMemo(
    () => VISA_TYPES.find((v) => v.id === visaTypeId) || VISA_TYPES[2],
    [visaTypeId]
  );

  return useMemo(() => {
    if (!selectedUni || !globalConfig) return { total: 0, parsedDormOptions: [] };

    const visaField = selectedVisa.field as 'calcTuitionD4' | 'calcTuitionD2_1' | 'calcTuitionD2_2' | 'calcTuitionD2_3';

    const opt = globalConfig.koreanLanguageOptions[selections.koreanLangIdx];
    const koreanLangCost = typeof opt === 'object' ? opt.price : (opt || 0);
    const consultingFee = globalConfig.consultingFee;
    const thirdPartyFee = globalConfig.thirdPartyFee;
    const applicationFee = selectedUni.applicationFee ?? globalConfig.applicationFee ?? 0;
    const enrollmentFee = selectedUni.enrollmentFee ?? globalConfig.enrollmentFee ?? 2000000;
    const dormVnCost = selections.dormVnMonths * globalConfig.dormVietnamPricePerMonth;

    const baseTuitionKrw = selectedUni[visaField] || 0;
    const defaultTerms = visaTypeId === 'd4-1' ? 4 : 1;
    const tuitionTerms = selections.tuitionTerms ?? defaultTerms;
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

    const dormKrCost = parsedDormOptions[selections.dormKrIdx]?.priceVnd || parsedDormOptions[0]?.priceVnd || 0;
    const flightCost = globalConfig.flightOptions[selections.flightIdx] || 0;

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
    };
  }, [selectedUni, visaTypeId, topikLevelId, selections, globalConfig, exchangeRate, selectedVisa]);
}
