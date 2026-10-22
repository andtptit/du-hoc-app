import type { GlobalConfig } from './types';
import { KRW_TO_VND } from './data';

export const DEFAULT_CONFIG: GlobalConfig = {
  consultingOptions: [39000000, 49000000, 60000000],
  thirdPartyFee: 7000000,
  applicationFee: 0,
  enrollmentFee: 2000000,
  koreanLanguageOptions: [
    { label: 'Tự học (0đ)', price: 0 },
    { label: 'Từ 0 đến TOPIK 2: 13.000.000 đ', price: 13000000 },
    { label: 'Từ 0 đến TOPIK 4: 26.000.000 đ', price: 26000000 },
  ],
  dormVietnamPricePerMonth: 880000,
  dormKoreaOptions: [
    { label: 'Tự thuê / Không ở KTX (0đ)', price: 0 },
    { label: 'Phòng 4 người (14M/6 tháng)', price: 14000000 },
    { label: 'Phòng 2 người (24M/6 tháng)', price: 24000000 },
  ],
  flightOptions: [0, 5000000, 8000000, 10000000, 13000000, 17000000],
  defaultTuitionKrw: 120000000 / KRW_TO_VND,
  exchangeRate: 18.5,
};
