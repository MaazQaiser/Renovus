"use client";

import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { Drawer } from "@/components/overlay/Drawer";
import { Button } from "@/components/primitives/Button";
import { ButtonGroup } from "@/components/primitives/ButtonGroup";
import { Text } from "@/components/primitives/Text";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { Select } from "@/components/forms/Select";
import { SECTORS, STAGES, initialsFromName, type CompanyInput } from "@/lib/companies";
import { ACCEPTED_LOGO_TYPES, fileToLogoDataUrl } from "@/lib/image";
import type { Company, CompanyStage, Sector } from "@/types/company";

const FORM_ID = "company-form";

interface FormState {
  name: string;
  sector: Sector;
  stage: CompanyStage;
  initials: string;
  logoUrl?: string;
}

function initialState(company?: Company): FormState {
  if (!company) {
    return {
      name: "",
      sector: "Technology Services",
      stage: "Not started",
      initials: "",
    };
  }
  return {
    name: company.name,
    sector: company.sector,
    stage: company.stage ?? "Not started",
    initials: company.initials ?? "",
    logoUrl: company.logoUrl,
  };
}

interface CompanyFormProps {
  company?: Company;
  onSubmit: (input: CompanyInput) => void;
  onDone: () => void;
}

/**
 * Split out so the drawer can remount it by key. That resets the fields on open
 * and when switching rows without an effect syncing props into state.
 */
function CompanyForm({ company, onSubmit, onDone }: CompanyFormProps) {
  const [state, setState] = useState<FormState>(() => initialState(company));
  const [nameError, setNameError] = useState<string | undefined>();
  const [logoError, setLogoError] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const previewInitials = state.initials.trim() || initialsFromName(state.name);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file twice still fires a change event.
    event.target.value = "";
    if (!file) return;

    setLogoError(undefined);
    try {
      const logoUrl = await fileToLogoDataUrl(file);
      setState((previous) => ({ ...previous, logoUrl }));
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : "Could not use that image.");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = state.name.trim();
    if (trimmed === "") {
      setNameError("Enter the PortCo name.");
      return;
    }
    setNameError(undefined);

    onSubmit({
      name: trimmed,
      sector: state.sector,
      stage: state.stage,
      initials: state.initials.trim() || undefined,
      logoUrl: state.logoUrl,
      // Preserve anything the seeded companies carry that the form no longer edits.
      shortName: company?.shortName,
      description: company?.description,
      headquarters: company?.headquarters,
      employeeCount: company?.employeeCount,
      revenueRange: company?.revenueRange,
      investmentYear: company?.investmentYear,
      lastAssessedAt: company?.lastAssessedAt,
    });
    onDone();
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <FormField label="PortCo name" required error={nameError}>
        <Input
          value={state.name}
          onChange={(event) => setState((p) => ({ ...p, name: event.target.value }))}
          placeholder="Profit Optics"
          autoComplete="off"
        />
      </FormField>

      <FormField label="Industry" required>
        <Select
          value={state.sector}
          onChange={(event) =>
            setState((p) => ({ ...p, sector: event.target.value as Sector }))
          }
          options={SECTORS.map((sector) => ({ value: sector, label: sector }))}
        />
      </FormField>

      <FormField
        label="Stage"
        required
        hint="How far this PortCo has got through assessment."
      >
        <Select
          value={state.stage}
          onChange={(event) =>
            setState((p) => ({ ...p, stage: event.target.value as CompanyStage }))
          }
          options={STAGES.map((stage) => ({ value: stage, label: stage }))}
        />
      </FormField>

      <FormField
        label="Logo"
        optionalLabel
        error={logoError}
        hint="PNG, JPG, WEBP or SVG. Resized to 128px. The initials avatar is used when there's no logo."
      >
        <div className="flex items-center gap-4">
          {state.logoUrl ? (
            // Data URL preview — see CompanyAvatar for why next/image is wrong here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.logoUrl}
              alt="Logo preview"
              className="size-12 shrink-0 rounded-md border border-glass-border bg-glass object-contain"
            />
          ) : (
            <span
              aria-hidden
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-accent-subtle font-display text-[15px] font-semibold text-accent"
            >
              {previewInitials}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={ImageUp}
              onClick={() => fileRef.current?.click()}
            >
              {state.logoUrl ? "Replace logo" : "Upload logo"}
            </Button>
            {state.logoUrl ? (
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={Trash2}
                onClick={() => setState((p) => ({ ...p, logoUrl: undefined }))}
              >
                Remove
              </Button>
            ) : null}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_LOGO_TYPES}
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </FormField>

      <FormField
        label="Initials"
        optionalLabel
        hint="Shown when there's no logo. Derived from the name when blank."
      >
        <Input
          value={state.initials}
          onChange={(event) => setState((p) => ({ ...p, initials: event.target.value }))}
          placeholder={initialsFromName(state.name) || "PO"}
          maxLength={3}
          autoComplete="off"
        />
      </FormField>

      {company ? (
        <Text size="caption" tone="tertiary">
          Renaming this company updates it everywhere, including the agent pickers.
        </Text>
      ) : null}
    </form>
  );
}

export interface CompanyFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The company being edited, or undefined to create a new one. */
  company?: Company;
  onSubmit: (input: CompanyInput) => void;
}

export function CompanyFormDrawer({
  open,
  onOpenChange,
  company,
  onSubmit,
}: CompanyFormDrawerProps) {
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={company ? "Edit PortCo" : "New PortCo"}
      description={
        company
          ? "Changes apply everywhere this PortCo appears, including assessments."
          : "Add a PortCo. It becomes selectable in every agent."
      }
      size="lg"
      footer={
        <ButtonGroup>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID}>
            {company ? "Save changes" : "Add PortCo"}
          </Button>
        </ButtonGroup>
      }
    >
      {open ? (
        <CompanyForm
          key={company?.id ?? "new"}
          company={company}
          onSubmit={onSubmit}
          onDone={() => onOpenChange(false)}
        />
      ) : null}
    </Drawer>
  );
}
