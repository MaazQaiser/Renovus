import type { Questionnaire } from "@/types/question";

export const assessmentQuestionnaires: Questionnaire[] = [
  {
    id: "assessment-sales",
    agentId: "assessment",
    departmentId: "sales",
    title: "Sales assessment",
    description: "Understand how sales work is performed and where effort concentrates.",
    sections: [
      {
        id: "current-state",
        title: "Current processes",
        description: "How the team currently performs its core work.",
        questions: [
          {
            id: "primary-processes",
            type: "multiple-choice",
            title: "What are the primary processes your team performs?",
            description: "Select every process that is a regular part of the team's work.",
            required: true,
            options: [
              { id: "prospect-research", label: "Prospect research" },
              { id: "outreach", label: "Outreach and follow-up" },
              { id: "qualification", label: "Lead qualification" },
              { id: "pipeline", label: "Pipeline updates" },
              { id: "proposals", label: "Proposal or quote preparation" },
              { id: "account-reviews", label: "Account reviews" },
              { id: "forecasting", label: "Forecasting" },
              { id: "contracts", label: "Contract administration" },
            ],
          },
          {
            id: "current-support",
            type: "single-choice",
            title: "How are these activities currently supported?",
            description: "Choose the option that best describes the team's usual tools.",
            required: true,
            options: [
              { id: "spreadsheets", label: "Mostly spreadsheets" },
              { id: "crm", label: "A CRM system" },
              { id: "crm-plus", label: "A CRM plus other tools" },
              { id: "email-docs", label: "Mostly email and documents" },
            ],
          },
        ],
      },
      {
        id: "manual-work",
        title: "Manual and repetitive work",
        description: "Where time is spent on activities that could be candidates for support.",
        questions: [
          {
            id: "manual-activities",
            type: "multiple-choice",
            title: "Which activities require significant manual effort?",
            required: true,
            options: [
              { id: "crm-entry", label: "Entering or updating records in the CRM" },
              { id: "list-building", label: "Building prospect or account lists" },
              { id: "qualifying", label: "Qualifying inbound or outbound leads" },
              { id: "scheduling", label: "Scheduling meetings" },
              { id: "decks", label: "Preparing decks or proposals" },
              { id: "forecast-updates", label: "Updating forecasts by hand" },
            ],
          },
          {
            id: "repetitive-tasks",
            type: "multiple-choice",
            title: "Which tasks are performed repeatedly by the team?",
            required: true,
            options: [
              { id: "follow-up", label: "Follow-up emails" },
              { id: "status-reporting", label: "Status reporting" },
              { id: "meeting-notes", label: "Meeting notes and recaps" },
              { id: "crm-hygiene", label: "CRM hygiene" },
              { id: "quotes", label: "Preparing standard quotes" },
            ],
          },
          {
            id: "manual-process-description",
            type: "textarea",
            title: "Describe a process that currently requires substantial manual effort.",
            description: "Include who is involved and what makes the work time-consuming.",
            placeholder: "Describe the process, the people involved, and where time is spent.",
            required: true,
            rows: 5,
          },
        ],
      },
      {
        id: "pain-points",
        title: "Pain points",
        description: "Challenges that affect the team's current workflow.",
        questions: [
          {
            id: "workflow-challenges",
            type: "multiple-choice",
            title: "What are the biggest challenges affecting your team's current workflow?",
            required: true,
            options: [
              { id: "fragmented-tools", label: "Fragmented tools" },
              { id: "slow-handoffs", label: "Slow handoffs between people or teams" },
              { id: "incomplete-data", label: "Incomplete or inconsistent data" },
              { id: "manual-reporting", label: "Manual reporting" },
              { id: "capacity", label: "Limited capacity" },
            ],
          },
          {
            id: "delay-frequency",
            type: "scale",
            title: "How often do these challenges delay work?",
            required: true,
            min: 1,
            max: 5,
            minLabel: "Rarely",
            maxLabel: "Constantly",
          },
          {
            id: "process-documented",
            type: "yes-no",
            title: "Is there a documented process for the team's core work?",
            required: true,
          },
        ],
      },
      {
        id: "opportunities",
        title: "Potential opportunities",
        description: "Where automation or AI may be relevant. This is input only — no analysis has run.",
        questions: [
          {
            id: "automation-areas",
            type: "multiple-choice",
            title: "Which areas do you believe could benefit from automation or AI?",
            required: true,
            options: [
              { id: "research", label: "Prospect or account research" },
              { id: "outreach-drafting", label: "Outreach drafting" },
              { id: "qualification-support", label: "Qualification support" },
              { id: "forecast-support", label: "Forecasting support" },
              { id: "reporting", label: "Reporting" },
              { id: "scheduling-support", label: "Scheduling" },
            ],
          },
          {
            id: "adoption-constraint",
            type: "single-choice",
            title: "What is the main constraint on adopting new tools for this work?",
            required: true,
            options: [
              { id: "time", label: "Time to implement" },
              { id: "data-quality", label: "Data quality" },
              { id: "ownership", label: "Unclear ownership" },
              { id: "budget", label: "Budget" },
              { id: "risk", label: "Risk or compliance" },
            ],
          },
          {
            id: "success-outcome",
            type: "text",
            title: "What outcome would indicate a useful improvement?",
            description: "Optional. A short statement is enough.",
            placeholder: "For example, less time spent updating the CRM each week.",
            required: false,
          },
        ],
      },
    ],
  },
];

export function getQuestionnaire(id: string): Questionnaire | undefined {
  return assessmentQuestionnaires.find((entry) => entry.id === id);
}

export function getQuestionnaireForDepartment(
  agentId: string,
  departmentId: string,
): Questionnaire | undefined {
  return assessmentQuestionnaires.find(
    (entry) => entry.agentId === agentId && entry.departmentId === departmentId,
  );
}
