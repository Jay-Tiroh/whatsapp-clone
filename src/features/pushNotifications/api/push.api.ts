import { api } from "@/core/lib/api";
import type {
  PushDeviceResponseDto,
  RegisterPushDevicePayload,
} from "../types/push.types";

export const pushApi = {
  register: async (
    installationId: string,
    payload: RegisterPushDevicePayload,
  ): Promise<PushDeviceResponseDto> => {
    const { data } = await api.put<PushDeviceResponseDto>(
      `/v1/me/push-devices/${installationId}`,
      payload,
    );
    return data;
  },

  unregister: async (installationId: string): Promise<void> => {
    await api.delete(`/v1/me/push-devices/${installationId}`);
  },
};
