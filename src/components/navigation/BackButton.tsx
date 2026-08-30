"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import type { AppHref } from "@/lib/routes";

export interface BackButtonProps {
  href?: AppHref;
  onClick?: () => void;
  label?: string;
}

export function BackButton({ href, onClick, label = "Back" }: BackButtonProps) {
  return (
    <Button variant="ghost" size="sm" href={href} onClick={onClick} leadingIcon={ArrowLeft}>
      {label}
    </Button>
  );
}
