// Simplified subjects structure without CA levels
export const ALL_SUBJECTS = [
  // Foundation subjects
  "Principles and Practice of Accounting",
  "Business Laws and Business Correspondence and Reporting",
  "Business Mathematics, Logical Reasoning and Statistics",
  "Business Economics and Business and Commercial Knowledge",
  
  // Intermediate subjects
  "Accounting",
  "Corporate and Other Laws",
  "Cost and Management Accounting",
  "Taxation",
  "Advanced Accounting",
  "Auditing and Assurance",
  "Enterprise Information Systems & Strategic Management",
  "Financial Management & Economics for Finance",
  
  // Final subjects
  "Financial Reporting",
  "Strategic Financial Management",
  "Advanced Auditing and Professional Ethics",
  "Corporate and Economic Laws",
  "Strategic Cost Management and Performance Evaluation",
  "Direct Tax Laws and International Taxation",
  "Indirect Tax Laws"
];

// Keep legacy export for backwards compatibility during transition
export interface CALevel {
  level: string;
  subjects: string[];
}

export const CA_LEVELS: CALevel[] = [
  {
    level: "All Subjects",
    subjects: ALL_SUBJECTS
  }
];
