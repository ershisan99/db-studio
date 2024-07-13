import { Label } from "@/components/ui/label";
import { useAutoId } from "@/hooks";
import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, errorMessage, ...props }, ref) => {
    const finalId = useAutoId(id);

    return (
      <div className={"grid gap-1.5"}>
        {!!label && <Label htmlFor={finalId}>{label}</Label>}
        <input
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
Input.displayName = "Input";

export { Input };
