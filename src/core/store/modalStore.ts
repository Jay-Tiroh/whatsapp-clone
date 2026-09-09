import { create } from "zustand";

type SheetDetent = number | "auto" | "peek";

type modalType = "action" | "qr";

interface ActionModalState {
  modalVisible: boolean;
  onDismiss: () => void;
  onOpen: () => void;
  title: string;
  message: string;
  primaryBtnText: string;
  secondaryBtnText?: string;
  primaryBtnVariant?:
    | "primary"
    | "secondary"
    | "danger"
    | "info"
    | "warning"
    | "success"
    | "outline"
    | "elevated"
    | "tertiary";
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  iconName?: string;
  iconColorClassName?: string;
  iconBgClassName?: string;
  update: (data: ActionModalUpdate) => void;
}

// callers shouldn't be able to clobber the action fns via update()
type ActionModalUpdate = Partial<
  Omit<ActionModalState, "update" | "onOpen" | "onDismiss" | "modalVisible">
>;

const actionModalDefaults: Omit<
  ActionModalState,
  "modalVisible" | "onDismiss" | "onOpen" | "update"
> = {
  title: "Action Required",
  message: "Are you sure you want to do this?",
  primaryBtnText: "Yes, I'm sure",
  secondaryBtnText: "Cancel",
  primaryBtnVariant: "primary",
  onPrimaryPress: () => null,
  onSecondaryPress: undefined,
  iconName: "warning",
  iconColorClassName: "accent-primary-500",
  iconBgClassName: "bg-primary-100",
};

export const useActionModalStore = create<ActionModalState>((set) => ({
  modalVisible: false,
  ...actionModalDefaults,
  onDismiss: () => set({ modalVisible: false }),
  onOpen: () => set({ modalVisible: true }),
  update: (data: ActionModalUpdate) => set(data),
}));

// reset back to defaults after the sheet's close animation finishes,
// so stale content doesn't flash the next time it opens with partial data
let actionModalResetTimeout: ReturnType<typeof setTimeout> | undefined;

useActionModalStore.subscribe((state, prevState) => {
  if (prevState.modalVisible && !state.modalVisible) {
    clearTimeout(actionModalResetTimeout);
    actionModalResetTimeout = setTimeout(() => {
      useActionModalStore.setState({ ...actionModalDefaults });
    }, 300);
  }
});

interface QrModalState {
  modalVisible: boolean;
  onDismiss: () => void;
  onOpen: () => void;
  name: string | undefined;
  phoneNumber?: string | undefined;
  avatarUrl: string | undefined;
  qrPayload?: string;
  isGroup?: boolean;
  update: (data: QrModalUpdate) => void;
}

type QrModalUpdate = Partial<
  Omit<QrModalState, "update" | "onOpen" | "onDismiss" | "modalVisible">
>;

const qrModalDefaults: Omit<
  QrModalState,
  "modalVisible" | "onDismiss" | "onOpen" | "update"
> = {
  name: "User name",
  phoneNumber: "",
  avatarUrl: "",
  qrPayload: "user name",
  isGroup: false,
};

export const useQrModalStore = create<QrModalState>((set) => ({
  modalVisible: false,
  ...qrModalDefaults,
  onDismiss: () => set({ modalVisible: false }),
  onOpen: () => set({ modalVisible: true }),
  update: (data: QrModalUpdate) => set(data),
}));

let qrModalResetTimeout: ReturnType<typeof setTimeout> | undefined;

useQrModalStore.subscribe((state, prevState) => {
  if (prevState.modalVisible && !state.modalVisible) {
    clearTimeout(qrModalResetTimeout);
    qrModalResetTimeout = setTimeout(() => {
      useQrModalStore.setState({ ...qrModalDefaults });
    }, 300);
  }
});
