import type { Department } from "@/types/department";

export const departments: Department[] = [
  {
    id: "sales",
    name: "Sales",
    description: "Revenue generation, pipeline, and account coverage.",
    icon: "briefcase",
    available: true,
    questionnaireId: "assessment-sales",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Demand generation and brand programs.",
    icon: "megaphone",
    available: false,
  },
  {
    id: "finance",
    name: "Finance",
    description: "Planning, reporting, and controls.",
    icon: "line-chart",
    available: false,
  },
  {
    id: "hr",
    name: "HR",
    description: "Talent, people operations, and workforce administration.",
    icon: "users",
    available: false,
  },
  {
    id: "operations",
    name: "Operations",
    description: "Delivery, process, and operating cadence.",
    icon: "workflow",
    available: false,
  },
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find((department) => department.id === id);
}
