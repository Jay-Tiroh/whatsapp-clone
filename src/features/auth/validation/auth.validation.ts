// features/auth/validation/auth.validation.ts
import { z } from "zod";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const countrySchema = z.object({
  code: z.string(),
  dialCode: z.string(),
  flag: z.string(),
  name: z.string(),
});

export const loginSchema = z
  .object({
    country: countrySchema
      .nullable()
      .refine((val) => val !== null, { message: "Please select a country" }),
    phone: z
      .string()
      .min(1, "Enter your phone number")
      .max(20, "Phone number is too long"),
  })
  .refine(
    (data) => {
      if (!data.country) return true; // country's own refine already flags this
      const dialDigits = digitsOnly(data.country.dialCode);
      const allDigits = digitsOnly(data.phone);
      const localDigits = allDigits.startsWith(dialDigits)
        ? allDigits.slice(dialDigits.length)
        : allDigits;
      // National significant number is realistically 7–12 digits
      return localDigits.length >= 7 && localDigits.length <= 12;
    },
    { message: "Enter a valid phone number", path: ["phone"] },
  );

export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginFormOutput = z.output<typeof loginSchema>;

// Verify OTP form — code length is dynamic per challenge (4–8 digits)
export const verifyOtpSchema = z.object({
  code: z
    .string()
    .min(4, "Code must be at least 4 digits")
    .max(8, "Code must be at most 8 digits")
    .regex(/^\d+$/, "Code must contain only digits"),
});
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
