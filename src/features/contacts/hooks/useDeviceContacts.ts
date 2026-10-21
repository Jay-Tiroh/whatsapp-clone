import { logger } from "@/shared/utils/logger";
import { toE164 } from "@/shared/utils/toE164";
import { Contact, ContactField, requestPermissionsAsync } from "expo-contacts";
import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

type ContactsStatus = "idle" | "loading" | "granted" | "denied";
type ContactDetails = { name: string; id: string; phones: string };

export function useDeviceContacts() {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [status, setStatus] = useState<ContactsStatus>("idle");
  const [contacts, setContacts] = useState<ContactDetails[]>([]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      setStatus("loading");
      const { status: permStatus } = await requestPermissionsAsync();

      if (permStatus !== "granted") {
        setStatus("denied");
        return;
      }

      const FIELDS = [ContactField.FULL_NAME, ContactField.PHONES] as const;
      const PAGE_SIZE = 500;
      let offset = 0;
      let results: Awaited<
        ReturnType<typeof Contact.getAllDetails<typeof FIELDS>>
      > = [];

      while (true) {
        const batch = await Contact.getAllDetails(FIELDS, {
          limit: PAGE_SIZE,
          offset,
        });
        results = results.concat(batch);
        if (batch.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }

      const details: ContactDetails[] = results.map((c) => ({
        name: c.fullName ?? "(no name)",
        id: c.id,
        phones:
          c.phones
            ?.map((p) => p.number)
            .filter(Boolean)
            .join(", ") ?? "(no phones)",
      }));
      setContacts(details);

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
    });

    return () => task.cancel();
  }, []);

  return { phoneNumbers, status, contacts };
}
