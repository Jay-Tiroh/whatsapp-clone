const SENSITIVE_KEYS = [
  "token",
  "accesstoken",
  "refreshtoken",
  "pushtoken",
  "devicetoken",
  "sessionid",
  "authorization",
  "cookie",
  "pin",
  "otp",
  "democode",
  "recoverycodes",
  "password",
  "publicurl",
  "phone",
  "phonenumber",
  "email",
];

// Keys whose *content* is fine to know exists but shouldn't be dumped in full —
// useful for chat message bodies during debugging (length/shape matters more than content).
const TRUNCATE_KEYS = ["message", "text", "body", "caption"];
const TRUNCATE_LENGTH = 20;

function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (Array.isArray(value)) return value.map((v) => redact(v, seen));
  if (value && typeof value === "object") {
    if (seen.has(value)) return "[CIRCULAR]";
    seen.add(value);
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => {
        const key = k.toLowerCase();
        const isSensitive = SENSITIVE_KEYS.some((s) => key.includes(s));
        if (isSensitive) return [k, "[REDACTED]"];

        const isTruncatable =
          typeof v === "string" && TRUNCATE_KEYS.some((s) => key.includes(s));
        if (isTruncatable) {
          const str = v as string;
          return [
            k,
            str.length > TRUNCATE_LENGTH
              ? `${str.slice(0, TRUNCATE_LENGTH)}…[${str.length} chars]`
              : str,
          ];
        }

        return [k, redact(v, seen)];
      }),
    );
  }
  return value;
}

export const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log(...args.map((a) => redact(a)));
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args.map((a) => redact(a)));
  },
  error: (...args: unknown[]) => {
    const sanitized = args.map((a) => redact(a));
    if (__DEV__) console.error(...sanitized);
    // forward sanitized errors to Sentry/Crashlytics in prod
    // e.g. Sentry.captureException(sanitized[0], { extra: { args: sanitized.slice(1) } });
  },
};
