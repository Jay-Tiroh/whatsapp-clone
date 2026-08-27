import { logger } from "@/shared/utils/logger";
import { toE164 } from "@/shared/utils/toE164";
import { Contact, ContactField, requestPermissionsAsync } from "expo-contacts";
import { useEffect, useState } from "react";

type ContactsStatus = "idle" | "loading" | "granted" | "denied";

export function useDeviceContacts() {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [status, setStatus] = useState<ContactsStatus>("idle");

  useEffect(() => {
    (async () => {
      setStatus("loading");
      const { status: permStatus } = await requestPermissionsAsync();

      if (permStatus !== "granted") {
        setStatus("denied");
        return;
      }

      const results = await Contact.getAllDetails([ContactField.PHONES]);

      const rawNumbers = results
        .flatMap((c) => c.phones?.map((p) => p.number) ?? [])
        .filter((n): n is string => !!n);

      const normalized = rawNumbers
        .map((n) => toE164(n))
        .filter((n): n is string => !!n);

      if (__DEV__) {
        logger.warn(
          `[useDeviceContacts] raw: ${rawNumbers.length}, valid E.164: ${normalized.length}, dropped: ${rawNumbers.length - normalized.length}`,
        );
        const dropped = rawNumbers.filter((n) => !toE164(n));
        logger.warn("[useDeviceContacts] dropped numbers:", dropped);
      }

      setPhoneNumbers(normalized);
      setStatus("granted");
    })();
  }, []);

  return { phoneNumbers, status };
}
