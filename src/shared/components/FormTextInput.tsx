import ThemedTextInput from "@/shared/components/ThemedTextInput";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { TextInputProps } from "react-native";

type FormTextInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
} & Omit<TextInputProps, "value" | "onChangeText" | "onBlur">;

export function FormTextInput<T extends FieldValues>({
  control,
  name,
  label,
  ...props
}: FormTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <ThemedTextInput
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}
