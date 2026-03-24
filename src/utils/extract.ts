export function extractNumbers(text: string): number[] {
  if (!text) return [];

  // Regex tìm các cụm số có phân tách ngàn (phẩy hoặc chấm) hoặc số liền
  // VD: 1,500,000 | 1.500.000 | 1500000
  const regex = /\b\d{1,3}(?:[.,]\d{3})*\b|\b\d+\b/g;
  const matches = text.match(regex);
  
  if (!matches) return [];

  const numbers = matches.map(m => {
    // Xóa bỏ tất cả dấu phẩy và chấm để ép về số nguyên
    const cleanStr = m.replace(/[.,]/g, '');
    return parseInt(cleanStr, 10);
  });

  // Lọc lấy các số liệu lớn (loại bỏ các số nhỏ như "1 kỳ", "6 tháng"...)
  // Giả định học phí tối thiểu là 10.000 KRW
  const validNumbers = numbers.filter(n => !isNaN(n) && n >= 10000);
  
  // Lọc trùng lặp và sắp xếp tăng dần
  const uniqueNumbers = Array.from(new Set(validNumbers)).sort((a, b) => a - b);
  return uniqueNumbers;
}

export function extractTuitionMin(text: string): number {
  const nums = extractNumbers(text);
  return nums.length > 0 ? nums[0] : 0;
}
