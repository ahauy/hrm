import * as yup from "yup";

export const loginSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username must be at least 3 characters")
    .min(3, "Username must be at least 3 characters"),
  password: yup
    .string()
    .required("Password must be at least 6 characters")
    .min(6, "Password must be at least 6 characters"),
});