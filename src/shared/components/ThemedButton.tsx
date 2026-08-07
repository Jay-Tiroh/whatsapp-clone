import React from "react";
import { Pressable, PressableProps, Text } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

// 1. Container Variants
const buttonVariants = tv({
  // ADDED: `gap-2` for consistent spacing between icons and text
  base: "flex-row items-center justify-center gap-2 rounded-2xl px-8 py-4.5 active:opacity-80",
  variants: {
    variant: {
      primary: "bg-primary",
      secondary: "bg-surface border border-border",
      tertiary: "bg-transparent",
      outline: "bg-transparent border border-primary",
      elevated: "bg-surface shadow-sm shadow-neutral-900/10",
    },
    isDisabled: {
      true: "opacity-50",
    },
  },
  defaultVariants: {
    variant: "primary",
    isDisabled: false,
  },
});

// 2. Text Variants
const textVariants = tv({
  base: "font-display-bold text-button",
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-foreground",
      tertiary: "text-primary",
      outline: "text-primary",
      elevated: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

// 3. Types
interface ThemedButtonProps
  extends PressableProps, VariantProps<typeof buttonVariants> {
  label: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const ThemedButton = ({
  label,
  variant,
  disabled,
  iconLeft,
  iconRight,
  className,
  ...props
}: ThemedButtonProps) => {
  const isButtonDisabled = !!disabled;

  return (
    <Pressable
      disabled={isButtonDisabled}
      className={buttonVariants({
        variant,
        isDisabled: isButtonDisabled,
        className,
      })}
      {...props}
    >
      {iconLeft}
      <Text className={textVariants({ variant })}>{label}</Text>
      {iconRight}
    </Pressable>
  );
};

export default ThemedButton;
