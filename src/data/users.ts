import type { MockCredential, User } from "@/types/session";

export const users: User[] = [
  {
    id: "jason-tanker",
    name: "Jason Tanker",
    email: "jason.tanker@renovuscapital.com",
    role: "operating-partner",
    roleLabel: "Operating Partner",
    title: "Operating Partner",
    initials: "JT",
    active: true,
  },
  {
    id: "jordan-lee",
    name: "Jordan Lee",
    email: "jordan.lee@northbridge.edu",
    role: "portfolio-executive",
    roleLabel: "Portfolio Executive",
    title: "Chief Operating Officer",
    initials: "JL",
    active: true,
  },
  {
    id: "priya-shah",
    name: "Priya Shah",
    email: "priya.shah@renovuscapital.com",
    role: "admin",
    roleLabel: "Platform Admin",
    title: "Platform Administrator",
    initials: "PS",
    active: true,
  },
  {
    id: "casey-nguyen",
    name: "Casey Nguyen",
    email: "casey.nguyen@renovuscapital.com",
    role: "operating-partner",
    roleLabel: "Operating Partner",
    title: "Operating Partner",
    initials: "CN",
    active: false,
  },
];

export const credentials: MockCredential[] = [
  {
    email: "jason.tanker@renovuscapital.com",
    password: "Renovus2026!",
    userId: "jason-tanker",
  },
  {
    email: "jordan.lee@northbridge.edu",
    password: "Portfolio2026!",
    userId: "jordan-lee",
  },
  {
    email: "priya.shah@renovuscapital.com",
    password: "Admin2026!",
    userId: "priya-shah",
  },
  {
    email: "casey.nguyen@renovuscapital.com",
    password: "Inactive2026!",
    userId: "casey-nguyen",
  },
];

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email === email);
}
