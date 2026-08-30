import type { AppHref } from "@/lib/routes";
import type { Tone } from "./common";

export type AgentId = "assessment" | "offshoring" | (string & {});

export type AgentStatus = "available" | "beta" | "coming-soon" | "in-progress" | "maintenance";

export interface AgentStep {
  id: string;
  label: string;
  shortLabel: string;
  route: string;
  optional?: boolean;
}

export interface AgentProgressStep {
  id: string;
  label: string;
}

export interface AgentProcessStep {
  id: string;
  title: string;
  description: string;
}

export interface AgentOutcome {
  id: string;
  label: string;
}

export interface AgentOverview {
  heading: string;
  description: string;
  aboutTitle: string;
  about: string;
  inProgressTitle: string;
  processTitle: string;
  processSteps: AgentProcessStep[];
  outcomesTitle: string;
  outcomes: AgentOutcome[];
  startLabel: string;
  continueLabel: string;
  backLabel: string;
}

export interface Agent {
  id: AgentId;
  name: string;
  tagline: string;
  description: string;
  purpose: string;
  status: AgentStatus;
  icon: string;
  /** Optional hero illustration under /public */
  artSrc?: string;
  accent: Tone;
  route: AppHref;
  steps: AgentStep[];
  capabilities: string[];
  estimatedMinutes: number;
  requiresDocuments: boolean;
  requiresDepartment: boolean;
  overview?: AgentOverview;
  progressSteps?: AgentProgressStep[];
}
