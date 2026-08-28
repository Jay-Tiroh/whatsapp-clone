import { usePinStore } from "@/core/store/pinStore";
import { useEffect, useState } from "react";

export function usePinPromptModal() {
  const [modalVisible, setModalVisible] = useState(false);
  const hasSetupPin = usePinStore((s) => s.hasSetupPin);
  const hasPromptedPinSetup = usePinStore((s) => s.hasPromptedPinSetup);
  const hasHydrated = usePinStore((s) => s.hasHydrated);
  const setPromptedPinSetup = usePinStore((s) => s.setPromptedPinSetup);

  useEffect(() => {
    if (hasHydrated && !hasSetupPin && !hasPromptedPinSetup) {
      // if (hasHydrated && !hasSetupPin) {
      setModalVisible(true);
    }
  }, [hasHydrated, hasSetupPin, hasPromptedPinSetup]);

  const handleDismiss = () => {
    setPromptedPinSetup();
    setModalVisible(false);
  };

  return { modalVisible, handleDismiss };
}
