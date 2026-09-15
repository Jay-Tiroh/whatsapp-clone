import { api } from "@/core/lib/api";
import type {
  ReceiptFrontiersResponseDto,
  ReceiptUpdateResponseDto,
  UpdateReceiptPayload,
} from "../types/receipt.types";

export const receiptApi = {
  markDelivered: async (
    conversationId: string,
    payload: UpdateReceiptPayload,
  ): Promise<ReceiptUpdateResponseDto> => {
    const { data } = await api.put<ReceiptUpdateResponseDto>(
      `/v1/conversations/${conversationId}/receipts/delivered`,
      payload,
    );
    return data;
  },

  markRead: async (
    conversationId: string,
    payload: UpdateReceiptPayload,
  ): Promise<ReceiptUpdateResponseDto> => {
    const { data } = await api.put<ReceiptUpdateResponseDto>(
      `/v1/conversations/${conversationId}/receipts/read`,
      payload,
    );
    return data;
  },

  getFrontiers: async (
    conversationId: string,
  ): Promise<ReceiptFrontiersResponseDto> => {
    const { data } = await api.get<ReceiptFrontiersResponseDto>(
      `/v1/conversations/${conversationId}/receipts`,
    );
    return data;
  },
};
