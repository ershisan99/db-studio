import { Label } from "@/components/ui/label";
import { useAutoId } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  type ChangeEvent,
  type InputHTMLAttributes,
  forwardRef,
  memo,
  useCallback,
} from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  onValueChange?: (value: string) => void;
}

const RawInput = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, id, onValueChange, onChange, errorMessage, ...props },
    ref,
  ) => {
    const finalId = useAutoId(id);
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        onValueChange?.(e.target.value);
      },
      [onValueChange, onChange],
    );

    return (
      <div className={"grid gap-1.5"}>
        {!!label && <Label htmlFor={finalId}>{label}</Label>}
        <input
          onChange={handleChange}
          id={finalId}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {!!errorMessage && (
          <p className="text-red-500 text-xs">{errorMessage}</p>
        )}
      </div>
    );
  },
);
RawInput.displayName = "Input";

const Input = memo(RawInput);
Input.displayName = "MemoizedInput";

export { Input };
