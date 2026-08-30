export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  questionnaireId?: string;
}