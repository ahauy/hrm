/**
 * Định dạng số tiền sang định dạng tiền tệ Việt Nam Đồng (VND)
 * Ví dụ: 15000000 -> 15.000.000 ₫
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "0 ₫";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(amount)));
}

/**
 * Tính toán lương theo công thức chuẩn:
 * Lương thực nhận = (Lương cơ bản ÷ Ngày công chuẩn) × Ngày công thực tế + Khoản Thưởng/Phạt
 */
export function calculatePayroll({
  baseSalary = 0,
  standardWorkDays = 26,
  actualWorkDays = 0,
  adjustment = 0,
}) {
  const base = Number(baseSalary) || 0;
  const standard = Number(standardWorkDays) || 26;
  const actual = Number(actualWorkDays) || 0;
  const adj = Number(adjustment) || 0;

  if (standard <= 0) return 0;
  const salaryByWorkDays = (base / standard) * actual;
  return Math.round(salaryByWorkDays + adj);
}
