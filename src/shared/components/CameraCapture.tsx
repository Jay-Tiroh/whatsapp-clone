import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Linking, Modal, Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";
const StyledMaterialCommunityIcons = withUniwind(MaterialCommunityIcons);

type CameraCaptureProps = {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string, meta?: { width?: number; height?: number }) => void;
};

export default function CameraCapture({
  visible,
  onClose,
  onCapture,
}: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView>(null);

  const capturingRef = useRef(false);
  const blocked =
    visible && permission && !permission.granted && !permission.canAskAgain;

  useEffect(() => {
    if (
      visible &&
      permission &&
      !permission.granted &&
      permission.canAskAgain
    ) {
      void requestPermission();
    }
  }, [visible, permission, requestPermission]);

  const handleCapture = async () => {
    if (capturingRef.current) return; // a double tap would send two photos
    capturingRef.current = true;
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        onCapture(photo.uri, { width: photo.width, height: photo.height });
      }
    } finally {
      capturingRef.current = false;
    }
  };

  if (visible && !permission?.granted) {
    requestPermission();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        {permission?.granted && (
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />
        )}
        {blocked && (
          <View className="flex-1 items-center justify-center px-8 gap-4">
            <Text className="text-white text-center text-body-lg">
              Camera access is turned off for ChatMe.
            </Text>
            <Pressable
              onPress={() => Linking.openSettings()}
              accessibilityRole="button"
              className="px-5 py-3 rounded-full bg-primary-400"
            >
              <Text className="text-white font-display-medium">
                Open Settings
              </Text>
            </Pressable>
          </View>
        )}

        <View className="absolute top-14 left-0 right-0 flex-row justify-between px-6">
          <Pressable
            onPress={onClose}
            className="size-11 items-center justify-center rounded-full bg-black/40"
          >
            <StyledMaterialCommunityIcons
              name="close"
              size={24}
              className="text-white"
            />
          </Pressable>
          <Pressable
            onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
            className="size-11 items-center justify-center rounded-full bg-black/40"
          >
            <StyledMaterialCommunityIcons
              name="camera-flip-outline"
              size={24}
              className="text-white"
            />
          </Pressable>
        </View>

        <View className="absolute bottom-12 left-0 right-0 items-center">
          <Pressable
            onPress={handleCapture}
            className="size-20 rounded-full border-4 border-white/90 items-center justify-center active:opacity-80"
          >
            <View className="size-16 rounded-full bg-white" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
