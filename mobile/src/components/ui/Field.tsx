import React, { forwardRef, type ReactNode } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { twMerge } from "tailwind-merge";

export interface FieldProps extends TextInputProps {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
}

export const Field = forwardRef<TextInput, FieldProps>(
  ({ label, icon, hint, error, className, ...props }, ref) => {
    return (
      <View className="mb-4">
        <Text className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </Text>
        <View className="relative justify-center">
          {icon && (
            <View className="absolute left-3.5 z-10 text-muted-foreground">
              {icon}
            </View>
          )}
          <TextInput
            ref={ref}
            className={twMerge(
              "w-full h-12 rounded-xl bg-surface border border-border text-foreground text-sm",
              icon ? "pl-11" : "pl-4",
              "pr-4 placeholder:text-muted-foreground/60",
              className
            )}
            placeholderTextColor="#888" // Replace with appropriate muted-foreground hex if needed
            {...props}
          />
        </View>
        {hint && !error && (
          <Text className="mt-1 text-xs text-muted-foreground">{hint}</Text>
        )}
        {error && (
          <Text className="mt-1 text-xs text-destructive">{error}</Text>
        )}
      </View>
    );
  }
);

Field.displayName = "Field";
