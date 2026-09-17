import { useFolderModalStore } from "@/core/store/modalStore";
import ThemedText from "@/shared/components/ThemedText";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ComponentProps, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);

const StyledMaterial = withUniwind(MaterialCommunityIcons);
const StyledFeather = withUniwind(Feather);

const StyledFontAwesome5 = withUniwind(FontAwesome5);

type FA6Name = ComponentProps<typeof StyledFontAwesome6>["name"];
type FA5Name = ComponentProps<typeof StyledFontAwesome6>["name"];
type MaterialName = ComponentProps<typeof StyledMaterial>["name"];
type FeatherName = ComponentProps<typeof StyledFeather>["name"];

type IconProps =
  | { iconType: "fontawesome"; icon: FA6Name }
  | { iconType: "material"; icon: MaterialName }
  | { iconType: "feather"; icon: FeatherName };

interface FolderItemProps {
  icon: FA6Name | MaterialName | FeatherName;
  label: string;
  rightElement?: React.ReactNode;
  hideChevron?: boolean;
  onPress?: () => void;
  iconType?: "fontawesome" | "fontawesome5" | "material" | "feather";
  hasBottomBorder?: boolean;
}

const FolderItem = ({
  icon,
  label,
  rightElement,
  hideChevron,
  onPress,
  iconType = "fontawesome",
  hasBottomBorder = false,
}: FolderItemProps) => {
  const Icon =
    iconType === "fontawesome" ? (
      <StyledFontAwesome6 name={icon} size={16} className="text-primary" />
    ) : iconType === "material" ? (
      <StyledMaterial name={icon} size={16} className="text-primary" />
    ) : iconType === "fontawesome5" ? (
      <StyledFontAwesome5 name={icon} size={16} className="text-primary" />
    ) : (
      <StyledFeather name={icon} size={16} className="text-primary" />
    );
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-4 py-3 px-5 active:opacity-70 ${hasBottomBorder && "border-b border-neutral-50 dark:border-neutral-600"}`}
    >
      <View className="size-8 rounded-full  items-center justify-center">
        {Icon}
      </View>
      <ThemedText
        type="bodyLg"
        weight="medium"
        color="label"
        className="flex-1"
      >
        {label}
      </ThemedText>
      {rightElement ? (
        rightElement
      ) : !hideChevron ? (
        <StyledFontAwesome6
          name="chevron-right"
          size={16}
          className="text-neutral-200 dark:text-neutral-300"
        />
      ) : null}
    </Pressable>
  );
};

const ModalActionBtn = ({
  type,
  onBack,
  onClose,
}: {
  type: "close" | "back";
  onBack?: () => void;
  onClose?: () => void;
}) => (
  <Pressable
    onPress={type === "back" ? onBack : onClose}
    className={`flex-row items-center gap-4 py-4 px-5 active:opacity-70 border-t-6 border-neutral-50 dark:border-neutral-600`}
  >
    {type === "back" ? (
      <StyledFontAwesome6
        name="arrow-left"
        size={20}
        className="text-neutral-300 dark:text-neutral-200"
      />
    ) : (
      <StyledMaterial name="close" size={24} className="text-red-400" />
    )}
    <ThemedText
      type="bodyLg"
      weight="medium"
      color={`${type === "back" ? "label" : "danger"}`}
      className="flex-1"
    >
      {type === "back" ? "Back" : "Close"}
    </ThemedText>
  </Pressable>
);
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const CONTENT_WIDTH = 320;

export default function FolderModal() {
  const { modalVisible, onDismiss } = useFolderModalStore();

  const [isRendered, setIsRendered] = useState(modalVisible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // page transition state
  const [activePage, setActivePage] = useState<0 | 1>(0);
  const pageX = useRef(new Animated.Value(0)).current;

  // height animation
  const contentHeight = useRef(new Animated.Value(0)).current;
  const [hasMeasuredHeight, setHasMeasuredHeight] = useState(false);
  const pageHeights = useRef<{ 0: number | null; 1: number | null }>({
    0: null,
    1: null,
  });

  const handlePageLayout = (page: 0 | 1) => (e: any) => {
    const measured = e.nativeEvent.layout.height;
    pageHeights.current[page] = measured;

    if (!hasMeasuredHeight && page === activePage) {
      contentHeight.setValue(measured);
      setHasMeasuredHeight(true); // <-- triggers re-render now
    }
  };

  const animateToPage = (page: 0 | 1) => {
    setActivePage(page);

    const targetHeight = pageHeights.current[page];
    const animations = [
      Animated.timing(pageX, {
        toValue: page === 1 ? -CONTENT_WIDTH : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ];

    // height can't use the native driver, so it runs alongside
    // (not literally "native-driven together", but started together
    // via Animated.parallel, which is what matters visually)
    if (targetHeight != null) {
      animations.push(
        Animated.timing(contentHeight, {
          toValue: targetHeight,
          duration: 260,
          useNativeDriver: false,
        }),
      );
    }

    Animated.parallel(animations).start();
  };

  const goToFolderList = () => animateToPage(1);
  const goBackToRoot = () => animateToPage(0);

  const handleClose = () => onDismiss();
  const router = useRouter();
  const handleNavigateToFolder = (folderId: string) => {
    handleClose();
    router.push(`/chats/folders/folder?folder=${folderId}`);
  };

  const handleNavigateToCreateFolder = () => {
    handleClose();
    router.push("/chats/folders?create=true");
  };
  useEffect(() => {
    if (modalVisible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 180,
          mass: 0.9,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
        setActivePage(0);
        pageX.setValue(0);
        if (pageHeights.current[0] != null) {
          contentHeight.setValue(pageHeights.current[0]);
          setHasMeasuredHeight(true);
        } else {
          setHasMeasuredHeight(false);
        }
      });
    }
  }, [modalVisible, backdropOpacity, translateY, pageX, contentHeight]);

  useEffect(() => {
    if (!isRendered || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [isRendered]);

  if (!isRendered) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      className="z-50"
      pointerEvents="box-none"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={60}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.55)" },
            ]}
          />
        )}
        <Pressable
          className="flex-1 justify-end pb-safe-offset-6 items-center p-6"
          onPress={handleClose}
        >
          <Animated.View
            style={{ transform: [{ translateY }] }}
            className="w-full max-w-80"
          >
            <Pressable
              className="w-full bg-surface rounded-[28px] overflow-hidden shadow-lg"
              style={{ width: CONTENT_WIDTH }}
            >
              {/* Animated-height clipping wrapper */}
              <Animated.View
                style={{
                  width: CONTENT_WIDTH,
                  height: hasMeasuredHeight ? contentHeight : undefined,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={{
                    flexDirection: "row",

                    alignItems: "flex-start",
                    width: CONTENT_WIDTH * 2,
                    transform: [{ translateX: pageX }],
                  }}
                >
                  {/* Page 0: root */}
                  <View
                    style={{ width: CONTENT_WIDTH }}
                    pointerEvents={activePage === 0 ? "auto" : "none"}
                    onLayout={handlePageLayout(0)}
                  >
                    <FolderItem
                      label="Add to folder"
                      icon="folder-open"
                      onPress={goToFolderList}
                      hasBottomBorder
                    />
                    <FolderItem
                      label="Create new folder"
                      icon="folder-plus"
                      hideChevron
                      onPress={handleNavigateToCreateFolder}
                    />
                    <ModalActionBtn type="close" onClose={handleClose} />
                  </View>

                  {/* Page 1: folder list */}
                  <View
                    style={{ width: CONTENT_WIDTH }}
                    pointerEvents={activePage === 1 ? "auto" : "none"}
                    onLayout={handlePageLayout(1)}
                  >
                    <FolderItem
                      label="Family"
                      icon="folder-open"
                      hasBottomBorder
                      hideChevron
                      onPress={() => handleNavigateToFolder("family")}
                    />
                    <FolderItem
                      label="Workspace"

                      icon="folder-open"
                      hasBottomBorder
                      hideChevron
                    />
                    <FolderItem
                      label="School"
                      icon="folder-open"
                      hasBottomBorder
                      hideChevron
                    />
                    <ModalActionBtn type="back" onBack={goBackToRoot} />
                  </View>
                </Animated.View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
