import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type Variant = "primary" | "mint" | "ghost" | "outline";

interface Props extends TouchableOpacityProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const buttonStyles: Record<Variant, string> = {
  primary: "bg-primary active:opacity-90",
  mint: "bg-[#5FD8A8] shadow-lg shadow-[#5FD8A8]/30 active:opacity-90",
  ghost: "bg-transparent active:bg-secondary/50",
  outline: "bg-transparent border border-border active:bg-secondary/50",
};

const textStyles: Record<Variant, string> = {
  primary: "text-primary-foreground",
  mint: "text-[#022A1A]",
  ghost: "text-foreground",
  outline: "text-foreground",
};

export const PrimaryButton = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, Props>(
  ({ variant = "primary", className, children, disabled, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={twMerge(
          "h-12 w-full rounded-xl px-5 items-center justify-center transition-all",
          buttonStyles[variant],
          disabled && "opacity-50",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {typeof children === "string" ? (
          <Text className={twMerge("text-sm font-semibold", textStyles[variant])}>
            {children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";
