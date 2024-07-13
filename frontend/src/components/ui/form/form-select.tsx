import { Select } from "@/components/ui";
import type { ComponentPropsWithoutRef } from "react";
import {
  type Control,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";

type Props<T extends FieldValues> = Omit<
  UseControllerProps<T>,
  "control" | "defaultValue" | "rules"
> &
  Omit<ComponentPropsWithoutRef<typeof Select>, "value" | "onValueChange"> & {
    control: Control<T>;
  };

export const FormSelect = <T extends FieldValues>({
  control,
  name,
  disabled,
  shouldUnregister,
  ...rest
}: Props<T>) => {
  const {
    field: { onChange, ...field },
  } = useController({
    control,
    name,
    disabled,
    shouldUnregister,
  });
  return <Select {...field} {...rest} onValueChange={onChange} />;
};
