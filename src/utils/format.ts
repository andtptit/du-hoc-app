/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SELECTIONS_KEY = 'duhoc_selections';

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

/**
 * Format sang USD, dùng tỷ giá VND/USD do người dùng nhập (mặc định 25000).
 * Sửa bug: không còn hardcode 25000.
 */
export const formatUSD = (amount: number, vndPerUsd: number = 25000): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / vndPerUsd);
};

export const formatKRW = (amount: number, vndPerKrw: number): string => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount / vndPerKrw);
};
