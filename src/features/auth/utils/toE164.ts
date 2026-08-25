// features/auth/utils/toE164.ts

import type { LoginFormOutput } from "../validation/auth.validation";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function toE164(values: LoginFormOutput): string {
  const dialDigits = digitsOnly(values.country!.dialCode);
  const allDigits = digitsOnly(values.phone);

  // avoid double-counting the dial code if the user typed it into the phone field
  const localDigits = allDigits.startsWith(dialDigits)
    ? allDigits.slice(dialDigits.length)
    : allDigits;

  return `+${dialDigits}${localDigits}`;
}
