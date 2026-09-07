import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
} from "react-native";
import { EaseView } from "react-native-ease/uniwind";
import { tv, type VariantProps } from "tailwind-variants";

// 1. Container Variants
const buttonVariants = tv({
  base: "flex-row items-center justify-center gap-2.5 rounded-2xl px-8 py-4.5",
  variants: {
    variant: {
      primary: "bg-primary",
      secondary: "bg-primary-tint",
      tertiary: "bg-transparent px-0 py-0",
      outline: "bg-transparent border border-primary",
      elevated: "bg-surface shadow-sm shadow-neutral-900/10",
    },
    isDisabled: {
      true: "opacity-50",
    },
  },
  compoundVariants: [
    {
      // Primary's disabled state has a fixed color in Figma (#ABDBBE),
      // not an opacity effect — so override with the light token directly.
      variant: "primary",
      isDisabled: true,
      className: "bg-primary-light opacity-100",
    },
  ],
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
      secondary: "text-primary",
      tertiary: "text-primary",
      outline: "text-primary",
      elevated: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

// 3. Bounce spring — equivalent to the linear() curve:
// linear(0, 0.011 0.5%, ... 0.997 66.3%, 1)
// Fitted to an underdamped spring step response (mass 1) with
// zeta ≈ 0.2945, wn ≈ 29.46 rad/s → stiffness ≈ 868, damping ≈ 17.4.
// (EaseView's `easing` only supports presets/cubic-bezier, not multi-stop
// linear() curves, so the spring is the faithful way to reproduce this.)
const BOUNCE_RELEASE_TRANSITION = {
  type: "spring" as const,
  damping: 17.4,
  stiffness: 868,
  mass: 1,
};

const PRESS_IN_TRANSITION = {
  type: "timing" as const,
  duration: 120,
  easing: "easeOut" as const,
};

interface ThemedButtonProps
  extends PressableProps, VariantProps<typeof buttonVariants> {
  label: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

const ThemedButton = ({
  label,
  variant,
  disabled,
  isLoading = false,
  iconLeft,
  iconRight,
  className,
  onPressIn,
  onPressOut,
  ...props
}: ThemedButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const isButtonDisabled = !!disabled || isLoading;

  return (
    <Pressable
      disabled={isButtonDisabled}
      onPressIn={(e) => {
        if (!isButtonDisabled) setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      {...props}
    >
      <EaseView
        className={buttonVariants({
          variant,
          isDisabled: isButtonDisabled,
          className,
        })}
        animate={{
          scale: pressed ? 0.94 : 1,
          opacity: pressed ? 0.85 : 1,
        }}
        transition={pressed ? PRESS_IN_TRANSITION : BOUNCE_RELEASE_TRANSITION}
      >
        {isLoading ? (
          <ActivityIndicator
            color={variant === "primary" ? "#fff" : undefined}
          />
        ) : (
          <>
            {iconLeft}
            <Text className={textVariants({ variant })}>{label}</Text>
            {iconRight}
          </>
        )}
      </EaseView>
    </Pressable>
  );
};

export default ThemedButton;
