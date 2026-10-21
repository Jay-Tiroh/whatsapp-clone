import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { receiptApi } from "../api/receipt.api";
import type { UpdateReceiptPayload } from "../types/receipt.types";

export function useMarkReceiptDelivered(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateReceiptPayload) =>
      receiptApi.markDelivered(conversationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["receipts", conversationId, "frontiers"],
      });
    },
  });
}

export function useMarkReceiptRead(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateReceiptPayload) =>
      receiptApi.markRead(conversationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["receipts", conversationId, "frontiers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations", "list"],
      });
    },
  });
}

export function useGetReceiptFrontiers(conversationId: string) {
  return useQuery({
    queryKey: ["receipts", conversationId, "frontiers"],
    queryFn: () => receiptApi.getFrontiers(conversationId),
    enabled: Boolean(conversationId),
  });
}
