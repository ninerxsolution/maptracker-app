import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const inputBase =
  "h-11 w-full rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-fg placeholder:text-faint transition-colors focus:border-primary focus:bg-surface-3 focus-visible:outline-none disabled:opacity-60";

export function Input({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        inputBase,
        invalid && "border-danger focus:border-danger",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon;
  error?: string;
  trailing?: React.ReactNode;
  hint?: string;
};

export function TextField({
  label,
  icon: Icon,
  error,
  trailing,
  hint,
  id,
  className,
  ...props
}: TextFieldProps) {
  const fieldId = id ?? props.name;
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-sm font-medium text-fg"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        )}
        <input
          id={fieldId}
          className={cn(
            inputBase,
            Icon && "pl-10",
            trailing && "pr-11",
            error && "border-danger focus:border-danger",
            className,
          )}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
}
