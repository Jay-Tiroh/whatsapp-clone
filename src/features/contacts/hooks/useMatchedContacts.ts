import { useEffect } from "react";
import { useDeviceContacts } from "./useDeviceContacts";
import { useMatchContacts } from "./useDiscovery";

export function useMatchedContacts() {
  const { phoneNumbers, status } = useDeviceContacts();
  const matchMutation = useMatchContacts();

  useEffect(() => {
    if (status === "granted" && phoneNumbers.length > 0) {
      matchMutation.mutate({ phoneNumbers });
    }
  }, [status, phoneNumbers, matchMutation]);

  return {
    matches: matchMutation.data?.matches ?? [],
    isLoading: status === "loading" || matchMutation.isPending,
    contactsDenied: status === "denied",
  };
}
