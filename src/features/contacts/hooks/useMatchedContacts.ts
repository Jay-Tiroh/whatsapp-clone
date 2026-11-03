// features/contacts/hooks/useMatchedContacts.ts
import { logger } from "@/shared/utils/logger";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useMemo } from "react";
import { discoveryApi } from "../api/discovery.api";
import type { ContactMatch } from "../types/discovery.types";
import { useDeviceContacts } from "./useDeviceContacts";

const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES_MS = 1000;
const MAX_RETRIES = 3;

type MatchResult = {
  matches: ContactMatch[];
  incomplete: boolean; // at least one batch failed permanently
  rateLimited: boolean; // the failure was a 429
};

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size)
    chunks.push(arr.slice(i, i + size));
  return chunks;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getRetryAfterMs(err: unknown): number | null {
  if (isAxiosError(err) && err.response?.status === 429) {
    const seconds = Number(err.response.headers?.["retry-after"]);
    if (!Number.isNaN(seconds) && seconds > 0) return seconds * 1000;
  }
  return null;
}

// Cache key only: lets the key change when the contact set changes
// without putting raw phone numbers into the (persisted) query key.
function hashNumbers(numbers: string[]): string {
  const s = [...numbers].sort().join(",");
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${numbers.length}:${(h >>> 0).toString(36)}`;
}

async function matchInBatches(
  phoneNumbers: string[],
  signal: AbortSignal,
): Promise<MatchResult> {
  const batches = chunk(phoneNumbers, BATCH_SIZE);
  const matches: ContactMatch[] = [];
  let incomplete = false;
  let rateLimited = false;

  for (let i = 0; i < batches.length; i++) {
    let attempt = 0;

    while (true) {
      if (signal.aborted) throw new Error("aborted");
      try {
        const result = await discoveryApi.matchContacts(
          { phoneNumbers: batches[i] },
          signal,
        );
        matches.push(...(result.matches ?? []));
        break;
      } catch (err) {
        if (signal.aborted) throw err;

        const is429 = isAxiosError(err) && err.response?.status === 429;
        if (is429 && attempt < MAX_RETRIES) {
          await sleep(getRetryAfterMs(err) ?? 2 ** attempt * 1000);
          attempt++;
          continue;
        }

        incomplete = true;
        rateLimited ||= is429;
        // log status only: never the error object (it carries the payload)
        logger.warn("Contact match batch failed", {
          batch: i,
          status: isAxiosError(err) ? err.response?.status : undefined,
        });
        break;
      }
    }

    if (i < batches.length - 1) await sleep(DELAY_BETWEEN_BATCHES_MS);
  }

  return { matches, incomplete, rateLimited };
}

export function useMatchedContacts() {
  const { phoneNumbers, status } = useDeviceContacts();
  const contactsKey = useMemo(() => hashNumbers(phoneNumbers), [phoneNumbers]);

  const query = useQuery({
    queryKey: ["contacts", "match", contactsKey],
    queryFn: ({ signal }) => matchInBatches(phoneNumbers, signal),
    enabled: status === "granted" && phoneNumbers.length > 0,
    staleTime: 1000 * 60 * 10, // reopening the screen costs nothing
    gcTime: 1000 * 60 * 30,
    retry: false, // retries are handled per batch above
  });

  return {
    matches: query.data?.matches ?? [],
    isLoading: status === "loading" || query.isLoading,
    isIncomplete: query.data?.incomplete ?? false,
    isRateLimited: query.data?.rateLimited ?? false,
    isError: query.isError,
    refetch: query.refetch,
    contactsDenied: status === "denied",
  };
}
