/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface University {
  id: string;
  name: string;
  nameKr: string;
  visaTop: number;
  address: string;
  rank: string;
  majors: string;
  admissionRequirements: string;
  tuitionD4: string;
  tuitionD2_2: string;
  tuitionD2_3: string;
  scholarship: string;
  dormitory: string;
  jobOpportunities: string;
  calcTuitionD4: number;
  calcTuitionD2_2: number;
  calcTuitionD2_3: number;
  image: string;
  minGpaD4: number;
  minGpaD2: number;
}

export interface GlobalConfig {
  consultingFee: number;
  thirdPartyFee: number;
  applicationFee: number;
  enrollmentFee: number;
  koreanLanguageOptions: number[];
  dormVietnamPricePerMonth: number;
  dormKoreaOptions: { label: string; price: number }[];
  flightOptions: number[];
  defaultTuitionKrw: number;
}

export interface Selections {
  koreanLangIdx: number;
  dormVnMonths: number;
  dormKrIdx: number;
  flightIdx: number;
  scholarshipPercent: number;
}

export interface FormData {
  name: string;
  phone: string;
  visaType: string;
  topikLevel: string;
  universityId: string;
  gpa: string;
}

export interface CostBreakdown {
  koreanLangCost: number;
  consultingFee: number;
  thirdPartyFee: number;
  applicationFee: number;
  enrollmentFee: number;
  dormVnCost: number;
  tuitionVnd: number;
  scholarshipAmount: number;
  dormKrCost: number;
  flightCost: number;
  total: number;
}
