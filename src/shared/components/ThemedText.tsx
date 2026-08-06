import { Text, type TextProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

const themedText = tv({
  base: "text-foreground",
  variants: {
    variant: {
      message: "text-message",
      timestamp: "text-timestamp text-muted",
      chatName: "text-chat-name font-medium",
      chatPreview: "text-chat-preview text-muted",
      sectionHeader: "text-xs text-muted text-center",
    },
  },
  defaultVariants: {
    variant: "message",
  },
});

type ThemedTextProps = TextProps &
  VariantProps<typeof themedText> & {
    className?: string;
  };

const ThemedText = ({ variant, className, ...props }: ThemedTextProps) => {
  return <Text className={themedText({ variant, className })} {...props} />;
};

export default ThemedText;
