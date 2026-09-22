import * as yup from "yup";

export const leaveRequestSchema = yup.object({
  fromDate: yup
    .string()
    .required("Vui lòng chọn ngày bắt đầu nghỉ"),
  toDate: yup
    .string()
    .required("Vui lòng chọn ngày kết thúc nghỉ")
    .test(
      "is-after-or-equal",
      "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu",
      function (value) {
        const { fromDate } = this.parent;
        if (!fromDate || !value) return true;
        return new Date(value) >= new Date(fromDate);
      }
    ),
  reason: yup
    .string()
    .trim()
    .required("Vui lòng nhập lý do xin nghỉ")
    .min(3, "Lý do xin nghỉ phải có ít nhất 3 ký tự")
    .max(500, "Lý do xin nghỉ không được vượt quá 500 ký tự"),
});
