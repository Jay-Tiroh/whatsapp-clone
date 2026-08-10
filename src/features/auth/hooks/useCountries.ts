import { useQuery } from "@tanstack/react-query";

export type Country = {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
};

const COUNTRIES_BASE_URL =
  process.env.EXPO_PUBLIC_REST_COUNTRIES_API_URL ??
  "https://restcountries.com/v3.1";
const API_KEY = process.env.EXPO_PUBLIC_REST_COUNTRIES_API_KEY;
const PAGE_LIMIT = 100; // free-plan max

type ApiCountryObject = {
  names?: { common?: string };
  codes?: { alpha_2?: string };
  flag?: { emoji?: string };
  calling_codes?: string[];
};

type ApiListResponse = {
  data: {
    objects: ApiCountryObject[];
    meta: {
      total: number;
      count: number;
      limit: number;
      offset: number;
      more: boolean;
    };
  };
};

function mapCountry(item: ApiCountryObject): Country | null {
  const name = item.names?.common;
  const flag = item.flag?.emoji;
  const code = item.codes?.alpha_2;
  if (!name || !flag || !code) return null;

  const rawDial = item.calling_codes?.[0];
  const dialCode = rawDial ? `+${rawDial}` : "";

  return { code, dialCode, flag, name };
}

async function fetchCountriesPage(
  offset: number,
): Promise<ApiListResponse["data"]> {
  if (!API_KEY) {
    throw new Error(
      "Missing EXPO_PUBLIC_RESTCOUNTRIES_API_KEY — set it in your .env",
    );
  }

  const params = new URLSearchParams({
    limit: String(PAGE_LIMIT),
    offset: String(offset),
    response_fields: "names.common,codes.alpha_2,flag.emoji,calling_codes",
  });

  const res = await fetch(`${COUNTRIES_BASE_URL}?${params}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.errors?.[0]?.message ?? res.statusText;
    throw new Error(`Failed to fetch countries (${res.status}): ${message}`);
  }

  const json: ApiListResponse = await res.json();
  return json.data;
}

async function fetchAllCountries(): Promise<Country[]> {
  const results: Country[] = [];
  let offset = 0;

  while (true) {
    const { objects, meta } = await fetchCountriesPage(offset);
    for (const item of objects) {
      const mapped = mapCountry(item);
      if (mapped) results.push(mapped);
    }
    if (!meta.more) break;
    offset += meta.limit;
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export const countriesQueryKey = ["countries", "all"] as const;

export function useCountries() {
  return useQuery({
    queryKey: countriesQueryKey,
    queryFn: fetchAllCountries,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
