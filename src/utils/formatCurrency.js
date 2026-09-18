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
  standardWorkDays = 22,
  actualWorkDays = 0,
  adjustment = 0,
}) {
  const base = Number(baseSalary) || 0;
  const standard = Number(standardWorkDays) || 22;
  const actual = Number(actualWorkDays) || 0;
  const adj = Number(adjustment) || 0;

  if (standard <= 0) return 0;
  const salaryByWorkDays = (base / standard) * actual;
  return Math.round(salaryByWorkDays + adj);
}

/**
 * Đọc số tiền Việt Nam Đồng thành chữ
 * Ví dụ: 15598324 -> "Mười lăm triệu năm trăm chín mươi tám nghìn ba trăm hai mươi tư đồng"
 */
export function numberToVietnameseWords(num) {
  num = Math.round(Number(num) || 0);
  if (num === 0) return "Không đồng";
  const isNegative = num < 0;
  num = Math.abs(num);

  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

  function readGroup(n, showZeroHundred) {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    const res = [];

    if (h > 0 || showZeroHundred) {
      res.push(digits[h] + " trăm");
    }

    if (t > 1) {
      res.push(digits[t] + " mươi");
      if (u === 1) res.push("mốt");
      else if (u === 4) res.push("tư");
      else if (u === 5) res.push("lăm");
      else if (u > 0) res.push(digits[u]);
    } else if (t === 1) {
      res.push("mười");
      if (u === 5) res.push("lăm");
      else if (u > 0) res.push(digits[u]);
    } else {
      if ((h > 0 || showZeroHundred) && u > 0) {
        res.push("linh " + digits[u]);
      } else if (u > 0) {
        res.push(digits[u]);
      }
    }
    return res.join(" ");
  }

  const groups = [];
  let temp = num;
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const showZero = i < groups.length - 1;
      const grpText = readGroup(g, showZero);
      if (grpText) {
        parts.push(grpText + (units[i] ? " " + units[i] : ""));
      }
    }
  }

  const result = (isNegative ? "Âm " : "") + parts.join(" ").trim() + " đồng";
  return result.charAt(0).toUpperCase() + result.slice(1);
}
