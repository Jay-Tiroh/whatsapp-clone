import { parsePhoneNumberFromString } from "libphonenumber-js";

export function toE164(
  rawNumber: string,
  defaultCountry: string = "NG",
): string | null {
  const parsed = parsePhoneNumberFromString(rawNumber, defaultCountry as any);
  return parsed?.isValid() ? parsed.number : null;
}
