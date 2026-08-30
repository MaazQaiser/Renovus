"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/primitives/IconButton";
import { Input, type InputProps } from "./Input";

export type PasswordInputProps = Omit<InputProps, "type" | "trailingIcon">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="pr-12"
        autoComplete={props.autoComplete ?? "current-password"}
      />
      <IconButton
        icon={visible ? EyeOff : Eye}
        label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 text-tertiary hover:text-foreground"
        onClick={() => setVisible((current) => !current)}
      />
    </div>
  );
}
