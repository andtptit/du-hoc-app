/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { University, GlobalConfig, Selections, CostBreakdown } from '../types';
import { VISA_TYPES } from '../data';

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
}: UseCostsParams): Partial<CostBreakdown> & { total: number } {
  const selectedVisa = useMemo(
    () => VISA_TYPES.find((v) => v.id === visaTypeId) || VISA_TYPES[2],
    [visaTypeId]
  );

  return useMemo(() => {
    if (!selectedUni || !globalConfig) return { total: 0 };

    const visaField = selectedVisa.field as 'calcTuitionD4' | 'calcTuitionD2_2' | 'calcTuitionD2_3';

    const koreanLangCost = globalConfig.koreanLanguageOptions[selections.koreanLangIdx] || 0;
    const consultingFee = globalConfig.consultingFee;
    const thirdPartyFee = globalConfig.thirdPartyFee;
    const applicationFee = globalConfig.applicationFee;
    const enrollmentFee = globalConfig.enrollmentFee;
    const dormVnCost = selections.dormVnMonths * globalConfig.dormVietnamPricePerMonth;

    const baseTuitionKrw = selectedUni[visaField] || globalConfig.defaultTuitionKrw;
    const tuitionVnd = baseTuitionKrw * exchangeRate;
    const scholarshipAmount = tuitionVnd * (selections.scholarshipPercent / 100);
    const finalTuitionVnd = tuitionVnd - scholarshipAmount;

    const dormKrCost = globalConfig.dormKoreaOptions[selections.dormKrIdx]?.price || 0;
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
    };
  }, [selectedUni, selectedVisa, topikLevelId, exchangeRate, globalConfig, selections]);
}
