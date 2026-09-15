import { api } from "@/core/lib/api";
import type {
  CreateMediaUploadDto,
  CreateMediaUploadResponseDto,
  MediaAssetResponseDto,
} from "../types/media.types";

export const mediaApi = {
  createUpload: async (
    payload: CreateMediaUploadDto,
  ): Promise<CreateMediaUploadResponseDto> => {
    const { data } = await api.post<CreateMediaUploadResponseDto>(
      "/v1/media/uploads",
      payload,
    );
    return data;
  },

  completeUpload: async (mediaId: string): Promise<MediaAssetResponseDto> => {
    const { data } = await api.post<MediaAssetResponseDto>(
      `/v1/media/uploads/${mediaId}/complete`,
    );
    return data;
  },
};
