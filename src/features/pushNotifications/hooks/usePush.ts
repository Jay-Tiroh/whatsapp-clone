import { useMutation } from "@tanstack/react-query";
import { pushApi } from "../api/push.api";
import type { RegisterPushDevicePayload } from "../types/push.types";

export function useRegisterPushDevice() {
  return useMutation({
    mutationFn: ({
      installationId,
      payload,
    }: {
      installationId: string;
      payload: RegisterPushDevicePayload;
    }) => pushApi.register(installationId, payload),
  });
}

export function useUnregisterPushDevice() {
  return useMutation({
    mutationFn: (installationId: string) => pushApi.unregister(installationId),
  });
}
