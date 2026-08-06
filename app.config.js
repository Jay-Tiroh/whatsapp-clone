module.exports = {
  name: "whatsapp-clone",
  slug: "whatsapp-clone",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "whatsappclone",
  userInterfaceStyle: "automatic",
  extra: {
    eas: {
      projectId: "67bb1638-d2f5-4f09-b65c-889bb8384863",
    },
  },
  ios: {
    icon: "./assets/expo.icon",
    bundleIdentifier: "com.yourcompany.whatsappclone",
    infoPlist: {
      NSCameraUsageDescription:
        "Allow WhatsApp Clone to access your camera for video calls and taking photos.",
      NSMicrophoneUsageDescription:
        "Allow WhatsApp Clone to access your microphone for voice notes and calls.",
      NSContactsUsageDescription:
        "Allow WhatsApp Clone to access your contacts to connect with friends.",
      NSPhotoLibraryUsageDescription:
        "Allow WhatsApp Clone to access your photos to share media.",
      NSPhotoLibraryAddUsageDescription:
        "Allow WhatsApp Clone to save photos to your library.",
      NSLocationWhenInUseUsageDescription:
        "Allow WhatsApp Clone to access your location to share with friends.",
      NSFaceIDUsageDescription:
        "Allow WhatsApp Clone to use FaceID to securely lock your chats.",
    },
  },
  android: {
    package: "com.yourcompany.whatsappclone",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_CONTACTS",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.USE_BIOMETRIC",
      "android.permission.USE_FINGERPRINT",
    ],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#E6F4FE",
        image: "./assets/images/splash-icon-light.png",
        imageWidth: 76,
        dark: {
          backgroundColor: "#111B21",
          image: "./assets/images/splash-icon-dark.png",
          imageWidth: 76,
        },
      },
    ],
    "expo-secure-store",
    "@config-plugins/react-native-webrtc",
    "expo-audio",
    "expo-sharing",
    [
      "expo-camera",
      {
        cameraPermission: "Allow WhatsApp Clone to access your camera.",
        microphonePermission: "Allow WhatsApp Clone to access your microphone.",
      },
    ],
    [
      "expo-contacts",
      {
        contactsPermission: "Allow WhatsApp Clone to access your contacts.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow WhatsApp Clone to use your location.",
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Allow WhatsApp Clone to access your photos.",
        savePhotosPermission: "Allow WhatsApp Clone to save photos.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you share them with your friends.",
      },
    ],
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Allow WhatsApp Clone to use Face ID.",
      },
    ],
    "expo-document-picker",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};
