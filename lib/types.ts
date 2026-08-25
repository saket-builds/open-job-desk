export type OutcomeStatus = "applied" | "interview" | "offer" | "closed";

export type DeskStatus =
  | "scored"
  | "pending-approval"
  | "approved"
  | "needs-you"
  | "ready"
  | "applied"
  | "skipped"
  | "rejected";

export interface MustHave {
  requirement: string;
  status: "met" | "partial" | "missing" | "unclear";
  evidence: string;
}

export interface Gate {
  name: string;
  status: string;
  reason: string;
}

export interface PipelineJob {
  id: string;
  title: string;
  company: string;
  url: string;
  source: string;
  description: string;
  postingStatus: string;
  eligibility: string;
  roleFamily: string;
  seniority: string;
  workMode: string;
  remote: boolean;
  locations: string[];
  experienceMin?: number;
  mustHaves: MustHave[];
  score: number;
  decision: string;
  autoEligible: boolean;
  mustHaveCoverage: number;
  gates: Gate[];
  reasons: string[];
  gaps: string[];
  deskStatus: DeskStatus;
  pauseReason?: string;
  employerJobId?: string;
  scoredAt: string;
  preparedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  submittedAt?: string;
  outcomeStatus?: OutcomeStatus;
  preparedAnswers?: Record<string, string>;
  blockers?: string[];
  knockouts?: string[];
  notes?: string;
}

export interface ProfileCheck {
  configured: boolean;
  missing: string[];
  fields: string[];
}

export interface ProfileSummary {
  name: string;
  email: string;
  phone: string;
  location: string;
  workAuthorization: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  availability?: string;
  currentCompensation?: string;
  targetCompensation?: string;
  roleFamilies: string[];
  seniority: string[];
  skills: string[];
  targetLocations: string[];
  workModes: string[];
  industries: string[];
  submissionMode: string;
  yearsExperience: number;
  autoSubmitMinScore: number;
  manualReviewMinScore: number;
  minMustHaveCoverage: number;
  excludedCompanies: string[];
}

export interface LedgerEntry {
  id: string;
  company: string;
  role: string;
  url: string;
  source: string;
  score: number;
  status: string;
  submittedAt: string;
  approval: string;
  answers?: Record<string, string>;
  employerJobId?: string;
}

export interface LedgerReview {
  submittedTotal: number;
  uniqueSubmittedTotal: number;
  outcomeCounts: {
    interview: number;
    rejected: number;
    offer: number;
    withdrawn: number;
  };
  nextStep: string;
}

export interface ResumeInfo {
  path: string;
  sha256?: string;
  bytes?: number;
}

export interface WorkRole {
  company: string;
  title: string;
  start: string;
  end?: string;
  location: string;
  current: boolean;
  summary?: string;
}

export interface EducationEntry {
  school: string;
  degree: string;
  field: string;
  start?: string;
  end?: string;
}

export interface ApplicationPacket {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  country: string;
  linkedin: string;
  github: string;
  website: string;
  workAuthorization: string;
  availability: string;
  yearsExperience: number;
  currentCtc: string;
  expectedCtc: string;
  productBased: string;
  roles: WorkRole[];
  education: EducationEntry[];
}
