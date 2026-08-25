import type { PipelineJob } from "./types";

const SCORED_AT = "2026-08-18T08:30:00.000Z";

export const SEED_JOBS: PipelineJob[] = [
  {
    id: "fourkites-senior-ai-engineer",
    title: "Senior AI Engineer",
    company: "FourKites",
    description:
      "Remote India LangGraph voice agents Python Java PostgreSQL REST",
    source: "greenhouse",
    url: "https://job-boards.greenhouse.io/fourkites/jobs/7981512",
    postingStatus: "active",
    eligibility: "eligible",
    roleFamily: "ai-ml",
    seniority: "senior",
    workMode: "remote",
    remote: true,
    locations: ["Remote", "India", "Chennai"],
    employerJobId: "greenhouse:7981512",
    mustHaves: [
      {
        requirement: "3+ years backend/software development",
        status: "met",
        evidence:
          "3.8+ years spanning Ericsson telecom backends and current AI engineering role.",
      },
      {
        requirement: "Python",
        status: "met",
        evidence:
          "Python used for FastAPI, RAG pipelines, and Ericsson automation.",
      },
      {
        requirement: "Java or GoLang",
        status: "met",
        evidence: "Java and Spring Boot at Ericsson and internship.",
      },
      {
        requirement: "LangGraph or similar agentic frameworks",
        status: "partial",
        evidence:
          "LangGraph on current voice receptionist and a shipped multi-node graph project.",
      },
      {
        requirement: "REST APIs and databases",
        status: "met",
        evidence:
          "REST APIs and PostgreSQL/pgvector on current AI work; SQL at prior roles.",
      },
    ],
    score: 91,
    decision: "review",
    autoEligible: true,
    mustHaveCoverage: 90,
    gates: [
      {
        name: "eligibility",
        status: "pass",
        reason: "Posting is explicitly eligible.",
      },
      {
        name: "posting-status",
        status: "pass",
        reason: "Direct application channel is active.",
      },
      {
        name: "work-mode",
        status: "pass",
        reason: "Work mode matches: remote.",
      },
      {
        name: "seniority",
        status: "pass",
        reason: "Seniority matches: senior.",
      },
      {
        name: "must-have-evidence",
        status: "pass",
        reason: "Must-have evidence coverage is 90%.",
      },
    ],
    reasons: [
      "Role family: ai-ml.",
      "Seniority: senior.",
      "Skills evidence: 90% of must-haves.",
      "Remote-compatible.",
      "Industry: ai.",
    ],
    gaps: ["Published compensation is unavailable or not directly comparable."],
    deskStatus: "needs-you",
    pauseReason: "Attach resume PDF manually, then submit on Greenhouse",
    scoredAt: SCORED_AT,
    notes: "Form partially filled in browser session.",
  },
  {
    id: "apexit-senior-ai-developer",
    title: "Senior Consultant - AI Developer",
    company: "Apex IT",
    description:
      "Bangalore/Remote senior AI application engineer RAG LangChain OpenAI Python",
    source: "greenhouse",
    url: "https://job-boards.greenhouse.io/apexit/jobs/4310338009",
    postingStatus: "active",
    eligibility: "eligible",
    roleFamily: "ai-ml",
    seniority: "senior",
    workMode: "remote",
    remote: true,
    locations: ["Bangalore", "Remote", "India"],
    employerJobId: "greenhouse:4310338009",
    mustHaves: [
      {
        requirement: "Software engineering background",
        status: "met",
        evidence:
          "3.8+ years professional software engineering including Ericsson production systems.",
      },
      {
        requirement: "AI/LLM-powered applications",
        status: "met",
        evidence:
          "Current role and portfolio: RAG assistant, LangGraph voice agent, UGC workflow.",
      },
      {
        requirement: "OpenAI or similar LLM APIs",
        status: "met",
        evidence: "OpenAI SDK listed on resume for RAG and voice systems.",
      },
      {
        requirement: "Python",
        status: "met",
        evidence: "Python/FastAPI is the primary current stack.",
      },
      {
        requirement: "RAG vector databases embeddings",
        status: "met",
        evidence:
          "Built document ingestion, embeddings, pgvector retrieval, and citations.",
      },
      {
        requirement: "Orchestration frameworks LangChain or equivalent",
        status: "met",
        evidence:
          "LangChain and LangGraph on current role and independent projects.",
      },
      {
        requirement: "Cloud architecture and secure integrations",
        status: "partial",
        evidence:
          "Azure listed; implemented AI guardrails and Fortify security work.",
      },
      {
        requirement: "Prompt engineering and AI debugging",
        status: "met",
        evidence:
          "Prompt engineering listed; evaluated retrieval quality and conversational performance.",
      },
    ],
    score: 93,
    decision: "review",
    autoEligible: true,
    mustHaveCoverage: 94,
    gates: [
      {
        name: "eligibility",
        status: "pass",
        reason: "Posting is explicitly eligible.",
      },
      {
        name: "posting-status",
        status: "pass",
        reason: "Direct application channel is active.",
      },
      {
        name: "work-mode",
        status: "pass",
        reason: "Work mode matches: remote.",
      },
      {
        name: "seniority",
        status: "pass",
        reason: "Seniority matches: senior.",
      },
      {
        name: "must-have-evidence",
        status: "pass",
        reason: "Must-have evidence coverage is 94%.",
      },
    ],
    reasons: [
      "Role family: ai-ml.",
      "Seniority: senior.",
      "Skills evidence: 94% of must-haves.",
      "Remote-compatible.",
      "Industry: ai.",
    ],
    gaps: ["Published compensation is unavailable or not directly comparable."],
    deskStatus: "ready",
    scoredAt: SCORED_AT,
  },
  {
    id: "connectwise-sr-software-engineer-ai",
    title: "Sr. Software Engineer - AI",
    company: "ConnectWise",
    description:
      "Senior AI Engineer Bangalore hybrid RAG Agentic FastAPI LangChain vector DBs LLMs Jenkins Azure",
    source: "greenhouse",
    url: "https://job-boards.greenhouse.io/connectwise/jobs/4703410005",
    postingStatus: "active",
    eligibility: "eligible",
    roleFamily: "ai-ml",
    seniority: "senior",
    workMode: "hybrid",
    remote: false,
    locations: ["Bangalore"],
    employerJobId: "greenhouse:4703410005",
    mustHaves: [
      {
        requirement: "Strong Python",
        status: "met",
        evidence:
          "Python is primary across stealth AI work, Ericsson, and portfolio RAG/voice projects.",
      },
      {
        requirement: "REST APIs with FastAPI or Flask",
        status: "met",
        evidence:
          "FastAPI backends for RAG and voice receptionist; Ericsson REST APIs.",
      },
      {
        requirement: "RAG and agentic AI",
        status: "met",
        evidence:
          "End-to-end RAG and LangGraph orchestration on current voice platform.",
      },
      {
        requirement: "LangChain or similar LLM framework",
        status: "met",
        evidence:
          "LangChain and LangGraph listed on current role and independent projects.",
      },
      {
        requirement: "Vector databases and embeddings",
        status: "met",
        evidence: "OpenAI embeddings, pgvector, Neon Postgres, and ChromaDB.",
      },
      {
        requirement: "CI/CD such as Git Docker Jenkins",
        status: "partial",
        evidence:
          "Git and Jenkins/Fortify CI at Ericsson; Docker is not an explicit resume claim.",
      },
      {
        requirement: "Cloud AWS Azure or GCP",
        status: "partial",
        evidence: "Azure listed on stealth and Ericsson stacks; AWS/GCP not claimed.",
      },
    ],
    score: 89,
    decision: "review",
    autoEligible: true,
    mustHaveCoverage: 86,
    gates: [
      {
        name: "eligibility",
        status: "pass",
        reason: "Posting is explicitly eligible.",
      },
      {
        name: "posting-status",
        status: "pass",
        reason: "Direct application channel is active.",
      },
      {
        name: "work-mode",
        status: "pass",
        reason: "Work mode matches: hybrid.",
      },
      {
        name: "seniority",
        status: "pass",
        reason: "Seniority matches: senior.",
      },
      {
        name: "must-have-evidence",
        status: "pass",
        reason: "Must-have evidence coverage is 86%.",
      },
    ],
    reasons: [
      "Role family: ai-ml.",
      "Seniority: senior.",
      "Skills evidence: 86% of must-haves.",
      "Target location: bangalore.",
      "Industry: ai.",
    ],
    gaps: ["Published compensation is unavailable or not directly comparable."],
    deskStatus: "needs-you",
    pauseReason: "Greenhouse form asks for salary expectations",
    scoredAt: SCORED_AT,
  },
  {
    id: "particle41-ai-engineer",
    title: "AI Engineer",
    company: "Particle41",
    description: "India remote AI engineer RAG LangGraph ElevenLabs",
    source: "greenhouse",
    url: "https://job-boards.greenhouse.io/particle41llc/jobs/4973733008",
    postingStatus: "active",
    eligibility: "eligible",
    roleFamily: "ai-ml",
    seniority: "mid",
    workMode: "remote",
    remote: true,
    locations: ["India", "Remote"],
    employerJobId: "greenhouse:4973733008",
    mustHaves: [
      {
        requirement: "Python",
        status: "met",
        evidence: "Python/FastAPI across current AI work and portfolio.",
      },
      {
        requirement: "LangChain or LangGraph",
        status: "met",
        evidence: "Both listed on current role and projects.",
      },
      {
        requirement: "Vector databases RAG agentic workflows",
        status: "met",
        evidence: "pgvector/ChromaDB RAG and LangGraph agent workflows.",
      },
      {
        requirement: "Production REST APIs",
        status: "met",
        evidence:
          "FastAPI services for retrieval and voice; Ericsson REST APIs.",
      },
      {
        requirement: "3+ years AI/ML model development",
        status: "partial",
        evidence:
          "Applied AI in current role; majority of tenure was telecom backend at Ericsson.",
      },
    ],
    score: 91,
    decision: "review",
    autoEligible: false,
    mustHaveCoverage: 90,
    gates: [
      {
        name: "eligibility",
        status: "pass",
        reason: "Posting is explicitly eligible.",
      },
      {
        name: "posting-status",
        status: "pass",
        reason: "Direct application channel is active.",
      },
      {
        name: "work-mode",
        status: "pass",
        reason: "Work mode matches: remote.",
      },
      {
        name: "seniority",
        status: "pass",
        reason: "Seniority matches: mid.",
      },
      {
        name: "must-have-evidence",
        status: "pass",
        reason: "Must-have evidence coverage is 90%.",
      },
    ],
    reasons: [
      "Role family: ai-ml.",
      "Seniority: mid.",
      "Skills evidence: 90% of must-haves.",
      "Remote-compatible.",
      "Industry: ai.",
    ],
    gaps: ["Published compensation is unavailable or not directly comparable."],
    deskStatus: "needs-you",
    pauseReason:
      "Mid-level role (not auto-eligible); form asks current and desired CTC",
    scoredAt: SCORED_AT,
  },
];
