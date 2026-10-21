import { isAxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import type { ContactMatch } from "../types/discovery.types";
import { useDeviceContacts } from "./useDeviceContacts";
import { useMatchContacts } from "./useDiscovery";

const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES_MS = 1000;
const MAX_RETRIES = 3;

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryAfterMs(err: unknown): number | null {
  if (isAxiosError(err) && err.response?.status === 429) {
    const header = err.response.headers?.["retry-after"];
    if (header) {
      const seconds = Number(header);
      if (!Number.isNaN(seconds)) return seconds * 1000;
    }
  }
  return null;
}

export function useMatchedContacts() {
  const { phoneNumbers, status } = useDeviceContacts();
  const { mutateAsync, isError, error } = useMatchContacts();
  const hasFiredRef = useRef(false);
  const [matches, setMatches] = useState<ContactMatch[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (
      status !== "granted" ||
      phoneNumbers.length === 0 ||
      hasFiredRef.current
    ) {
      return;
    }
    hasFiredRef.current = true;

    const runBatches = async () => {
      setIsMatching(true);
      const batches = chunk(phoneNumbers, BATCH_SIZE);
      const allMatches: ContactMatch[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        let attempt = 0;

        while (attempt <= MAX_RETRIES) {
          try {
            const result = await mutateAsync({ phoneNumbers: batch });
            allMatches.push(...(result.matches ?? []));
            break;
          } catch (err) {
            const retryAfterMs = getRetryAfterMs(err);
            const isRateLimited =
              isAxiosError(err) && err.response?.status === 429;

            if (isRateLimited && attempt < MAX_RETRIES) {
              const backoffMs = retryAfterMs ?? 2 ** attempt * 1000;
              if (__DEV__) {
                console.warn(
                  `[useMatchedContacts] batch ${i} rate-limited, retrying in ${backoffMs}ms (attempt ${attempt + 1})`,
                );
              }
              await sleep(backoffMs);
              attempt++;
              continue;
            }

            if (__DEV__) {
              console.warn(
                `[useMatchedContacts] batch ${i} failed permanently:`,
                err,
              );
            }
            break;
          }
        }

        if (i < batches.length - 1) {
          await sleep(DELAY_BETWEEN_BATCHES_MS);
        }
      }

      setMatches(allMatches);
      setIsMatching(false);
    };

    runBatches();
  }, [status, phoneNumbers, mutateAsync]);

  if (__DEV__ && isError) {
    console.warn("[useMatchedContacts] match request failed:", error);
  }

  return {
    matches,
    isLoading: status === "loading" || isMatching,
    contactsDenied: status === "denied",
  };
}
