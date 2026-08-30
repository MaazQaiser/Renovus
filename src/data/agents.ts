import type { Agent } from "@/types/agent";

export const agents: Agent[] = [
  {
    id: "assessment",
    name: "Sales function Assessment",
    tagline: "Baseline how opportunities are generated, pursued, and won.",
    description:
      "Build a clear sales baseline for a portfolio company, then surface where AI can improve conversion, coverage, and operating leverage.",
    purpose:
      "Establish a sales baseline for a portfolio company and identify where AI or automation could create value.",
    status: "available",
    icon: "clipboard-list",
    artSrc: "/agents/agent-art-sales.png",
    accent: "accent",
    route: "/agents/assessment",
    estimatedMinutes: 45,
    requiresDocuments: false,
    requiresDepartment: false,
    overview: {
      heading: "Establish a sales baseline",
      description:
        "A conversational assessment of how opportunities are generated, pursued, and won.",
      aboutTitle: "About this assessment",
      inProgressTitle: "Assessment in progress",
      about:
        "Answer routing questions, then a tailored funnel or relationship path based on how the sales function works today.",
      processTitle: "What you'll do",
      processSteps: [
        {
          id: "conversation",
          title: "Complete the conversation",
          description: "Select a company and answer sales baseline questions in chat.",
        },
        {
          id: "analysis",
          title: "Run analysis",
          description: "Submit the assessment for analysis.",
        },
        {
          id: "results",
          title: "Review the report",
          description: "Review opportunities identified from the assessment.",
        },
      ],
      outcomesTitle: "What you'll get",
      outcomes: [
        { id: "baseline", label: "Sales baseline" },
        { id: "model", label: "Funnel or relationship profile" },
        { id: "gaps", label: "Instrumentation gaps" },
        { id: "opportunities", label: "AI opportunities" },
      ],
      startLabel: "Start assessment",
      continueLabel: "Continue assessment",
      backLabel: "Back to agents",
    },
    capabilities: [
      "Select a portfolio company in chat",
      "Complete the Sales Baseline conversation",
      "Surface prioritized AI opportunities",
    ],
    progressSteps: [
      { id: "assessment", label: "Assessment" },
      { id: "processing", label: "Analysis" },
      { id: "results", label: "Results" },
    ],
    steps: [
      {
        id: "assessment",
        label: "Assessment",
        shortLabel: "Chat",
        route: "/agents/assessment",
      },
      {
        id: "processing",
        label: "Analysis",
        shortLabel: "Analysis",
        route: "/agents/assessment/processing",
      },
      {
        id: "results",
        label: "Results",
        shortLabel: "Results",
        route: "/agents/assessment/results",
      },
    ],
  },
  {
    id: "offshoring",
    name: "Offshoring potential assessment",
    tagline: "Find processes ready for offshore delivery.",
    description:
      "Evaluate which business processes in a Knowledge and Talent company are suitable to offshore, with clear fit, risk, and readiness signals.",
    purpose:
      "Identify which business processes could potentially be offshored using company information, documents, and questionnaire responses.",
    status: "available",
    icon: "globe",
    artSrc: "/agents/agent-art-offshoring.png",
    accent: "info",
    route: "/agents/offshoring",
    estimatedMinutes: 25,
    requiresDocuments: true,
    requiresDepartment: false,
    capabilities: [
      "Select a portfolio company in chat",
      "Upload the company payroll sheet",
      "Answer offshoring suitability questions",
    ],
    progressSteps: [
      { id: "assessment", label: "Assessment" },
      { id: "processing", label: "Analysis" },
      { id: "results", label: "Results" },
    ],
    steps: [
      {
        id: "assessment",
        label: "Assessment",
        shortLabel: "Chat",
        route: "/agents/offshoring",
      },
      {
        id: "processing",
        label: "Analysis",
        shortLabel: "Analysis",
        route: "/agents/offshoring/processing",
      },
      {
        id: "results",
        label: "Results",
        shortLabel: "Results",
        route: "/agents/offshoring/results",
      },
    ],
  },
  {
    id: "operational",
    name: "Operational assessment",
    tagline: "Map operating workflows for efficiency gains.",
    description:
      "We're building a deeper look at day-to-day operations, throughput, quality, and cost across Renovus portfolio companies.",
    purpose:
      "Identify operational processes where AI or automation could improve throughput, quality, or cost.",
    status: "in-progress",
    icon: "activity",
    artSrc: "/agents/agent-art-operational.png",
    accent: "warning",
    route: "/agents",
    estimatedMinutes: 40,
    requiresDocuments: false,
    requiresDepartment: false,
    capabilities: [
      "Map operating workflows",
      "Score process automation potential",
      "Prioritize operational opportunities",
    ],
    steps: [],
  },
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find((agent) => agent.id === id);
}
