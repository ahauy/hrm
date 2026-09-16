import { z } from "zod";

export const leaveRequestSchema = z
  .object({
    fromDate: z
      .string({ required_error: "Vui lòng chọn ngày bắt đầu nghỉ" })
      .min(1, { message: "Vui lòng chọn ngày bắt đầu nghỉ" }),
    toDate: z
      .string({ required_error: "Vui lòng chọn ngày kết thúc nghỉ" })
      .min(1, { message: "Vui lòng chọn ngày kết thúc nghỉ" }),
    reason: z
      .string({ required_error: "Vui lòng nhập lý do xin nghỉ" })
      .trim()
      .min(3, { message: "Lý do xin nghỉ phải có ít nhất 3 ký tự" })
      .max(500, { message: "Lý do xin nghỉ không được vượt quá 500 ký tự" }),
  })
  .refine(
    (data) => {
      if (!data.fromDate || !data.toDate) return true;
      return new Date(data.toDate) >= new Date(data.fromDate);
    },
    {
      message: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu",
      path: ["toDate"],
    }
  );
