export function extractNumbers(text: string): number[] {
  if (!text) return [];

  // Hỗ trợ cả dấu cách làm phân cách ngàn, ví dụ: "1 500 000"
  // Regex tìm các cụm số có phân tách (phẩy, chấm hoặc cách) hoặc số liền
  const regex = /\b\d{1,3}(?:[.,\s]\d{3})*\b|\b\d+\b/g;
  const matches = text.match(regex);
  
  if (!matches) return [];

  const numbers = matches.map(m => {
    // Xóa bỏ tất cả dấu phẩy, chấm và khoảng trắng để ép về số nguyên
    const cleanStr = m.replace(/[.,\s]/g, '');
    return parseInt(cleanStr, 10);
  });

  // Lọc lấy các số liệu lớn (loại bỏ các số nhỏ như "1 kỳ", "4 kỵ"...)
  // Giảm ngưỡng xuống 100 KRW để cho phép các phí nhỏ hơn nếu cần
  const validNumbers = numbers.filter(n => !isNaN(n) && n >= 100);
  
  // Lọc trùng lặp và sắp xếp tăng dần
  const uniqueNumbers = Array.from(new Set(validNumbers)).sort((a, b) => a - b);
  return uniqueNumbers;
}

export function extractTuitionMin(text: string): number {
  const nums = extractNumbers(text);
  return nums.length > 0 ? nums[0] : 0;
}
