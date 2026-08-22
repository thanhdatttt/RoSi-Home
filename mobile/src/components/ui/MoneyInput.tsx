import React, { useState, useEffect } from "react";
import { Field, type FieldProps } from "./Field";

export interface MoneyInputProps extends Omit<FieldProps, 'value' | 'onChangeText'> {
  value: string | number;
  onChangeText: (rawNumber: string) => void;
}

export function MoneyInput({ value, onChangeText, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value === undefined || value === null || value === "") {
      setDisplayValue("");
    } else {
      const numericStr = String(value).replace(/\D/g, "");
      const parsed = parseInt(numericStr, 10);
      if (!isNaN(parsed)) {
        setDisplayValue(parsed.toLocaleString("en-US"));
      } else {
        setDisplayValue("");
      }
    }
  }, [value]);

  const handleChangeText = (text: string) => {
    const numericStr = text.replace(/\D/g, "");
    if (!numericStr) {
      setDisplayValue("");
      onChangeText("");
      return;
    }
    const numericVal = parseInt(numericStr, 10);
    setDisplayValue(numericVal.toLocaleString("en-US"));
    onChangeText(numericStr);
  };

  return (
    <Field
      {...props}
      value={displayValue}
      onChangeText={handleChangeText}
      keyboardType="decimal-pad"
    />
  );
}
