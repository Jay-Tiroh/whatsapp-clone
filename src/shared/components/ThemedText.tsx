import { Text, type TextProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

// 1. Text Variants
const textVariants = tv(
  {
    base: "text-foreground",
    variants: {
      type: {
        h1: "text-h1 font-display-bold",
        h2: "text-h2 font-display-bold",
        h3: "text-h3 font-display-bold",
        h4: "text-h4 font-display-bold",
        h5: "text-h5 font-display-bold",
        h6: "text-h6 font-display-bold",
        bodyXl: "text-body-xl font-display-regular",
        bodyLg: "text-body-lg font-display-regular",
        bodyMd: "text-body-md font-display-regular",
        bodySm: "text-body-sm font-display-regular",
        title2: "text-title2 font-display-bold",
        callout: "text-callout font-display-regular",
        button: "text-button font-display-bold",
        buttonSm: "text-button-sm font-display-bold",
      },
      weight: {
        regular: "font-display-regular",
        medium: "font-display-medium",
        semibold: "font-display-semibold",
        bold: "font-display-bold",
      },
      color: {
        default: "text-neutral-900 dark:text-white/90",
        muted: "text-neutral-300 dark:text-neutral-200",
        accent: "text-neutral-900 dark:text-primary-50",
        primary: "text-primary",
        inverse: "text-white dark:text-neutral-900",
        danger: "text-red-400",
        label: "text-neutral-600 dark:text-neutral-50",
      },
    },
    defaultVariants: {
      type: "bodyMd",
      color: "default",
    },
  },
  {
    // Tell tailwind-merge these are font-size tokens, not colors,
    // so they don't get deduped against the `color` variant's classes.
    twMergeConfig: {
      extend: {
        classGroups: {
          "font-size": [
            {
              text: [
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "body-xl",
                "body-lg",
                "body-md",
                "body-sm",
                "title2",
                "callout",
                "button",
                "button-sm",
              ],
            },
          ],
        },
      },
    },
  },
);

// 2. Types
interface ThemedTextProps
  extends TextProps, VariantProps<typeof textVariants> {}

// 3. Component
const ThemedText = ({
  type,
  weight,
  color,
  className,
  children,
  ...props
}: ThemedTextProps) => {
  return (
    <Text
      className={textVariants({ type, weight, color, className })}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ThemedText;
