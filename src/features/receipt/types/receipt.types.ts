import type { components } from "@/core/types/api";

// ---- Raw DTO Types derived directly from OpenAPI schema ----

export type UpdateReceiptDto = components["schemas"]["UpdateReceiptDto"];
export type ReceiptBoundaryResponseDto =
  components["schemas"]["ReceiptBoundaryResponseDto"];
export type ReceiptUpdateResponseDto =
  components["schemas"]["ReceiptUpdateResponseDto"];
export type ReceiptFrontierResponseDto =
  components["schemas"]["ReceiptFrontierResponseDto"];
export type ReceiptFrontiersResponseDto =
  components["schemas"]["ReceiptFrontiersResponseDto"];

// ---- Legacy / Convenience Payload Aliases ----

export type UpdateReceiptPayload = UpdateReceiptDto;
