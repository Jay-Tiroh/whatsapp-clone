// ---- Request Payloads ----

export interface UpdateReceiptPayload {
  throughMessageId: string;
}

// ---- Raw Backend DTOs ----

export interface ReceiptBoundaryResponseDto {
  messageId: string;
  at: string;
}

export interface ReceiptUpdateResponseDto {
  conversationId: string;
  status: "delivered" | "read";
  throughMessageId: string;
  at: string;
  changed: boolean;
  unreadCount: number;
  version: number;
  delivered: ReceiptBoundaryResponseDto;
  read: ReceiptBoundaryResponseDto | null;
}

export interface ReceiptFrontierResponseDto {
  userId: string;
  version: number;
  delivered: ReceiptBoundaryResponseDto | null;
  read: ReceiptBoundaryResponseDto | null;
}

export interface ReceiptFrontiersResponseDto {
  conversationId: string;
  items: ReceiptFrontierResponseDto[];
}
