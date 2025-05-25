// Centralized CA Levels and Subjects structure
// Update this file to add/remove levels or subjects

export interface CALevel {
  level: string;
  subjects: string[];
}

export const CA_LEVELS: CALevel[] = [
  {
    level: "CA Foundation",
    subjects: [
      "Principles and Practice of Accounting",
      "Business Laws and Business Correspondence and Reporting",
      "Business Mathematics, Logical Reasoning and Statistics",
      "Business Economics and Business and Commercial Knowledge"
    ]
  },
  {
    level: "CA Intermediate",
    subjects: [
      "Accounting",
      "Corporate and Other Laws",
      "Cost and Management Accounting",
      "Taxation",
      "Advanced Accounting",
      "Auditing and Assurance",
      "Enterprise Information Systems & Strategic Management",
      "Financial Management & Economics for Finance"
    ]
  },
  {
    level: "CA Final",
    subjects: [
      "Financial Reporting",
      "Strategic Financial Management",
      "Advanced Auditing and Professional Ethics",
      "Corporate and Economic Laws",
      "Strategic Cost Management and Performance Evaluation",
      "Direct Tax Laws and International Taxation",
      "Indirect Tax Laws"
    ]
  }
];

// USAGE EXAMPLES (in any component):
// import { CA_LEVELS } from "@/data/caLevels";
// const foundationSubjects = CA_LEVELS.find(l => l.level === "CA Foundation")?.subjects;
// const allLevels = CA_LEVELS.map(l => l.level);
