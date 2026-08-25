import {
  isHardTargetTitle,
  isListableTitle,
  isLocationCompatible,
  isObviousOnsiteAbroadList,
  isOpenRemote,
  isSoftTargetTitle,
  jdHasAiSignals,
  mentionsIndia,
  passesListStage,
  passesPostJdFilter,
  requiresResidencyAbroad,
} from "../lib/discovery-filters.ts";

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

assert(isHardTargetTitle("Applied AI Engineer"), "hard AI title");
assert(isHardTargetTitle("LLM Engineer"), "LLM title");
assert(isHardTargetTitle("AI Engineer"), "ai word title");
assert(!isHardTargetTitle("Engineering Manager"), "block manager");

assert(isSoftTargetTitle("Backend Engineer"), "soft backend");
assert(!isSoftTargetTitle("Sales Engineer"), "block sales-ish");

assert(
  passesListStage("AI Engineer", "Remote - Worldwide"),
  "remote worldwide passes list",
);
assert(
  passesListStage("AI Engineer", "Bangalore, India"),
  "bangalore passes list",
);
assert(
  !passesListStage("AI Engineer", "San Francisco - Onsite"),
  "SF onsite drops at list",
);
assert(
  passesListStage("Backend Engineer", "Remote"),
  "soft title remote passes list",
);

assert(isOpenRemote("Remote"), "remote keyword");
assert(isOpenRemote("", ""), "empty is open remote");
assert(mentionsIndia("Bengaluru"), "bengaluru");
assert(!mentionsIndia("San Francisco"), "not india");

assert(
  isLocationCompatible("Remote", "Work from anywhere. Python and LLM experience."),
  "open remote compatible",
);
assert(
  isLocationCompatible("Bangalore, India", ""),
  "india compatible",
);
assert(
  !isLocationCompatible(
    "San Francisco",
    "Onsite in our SF office. Must be located in the United States.",
  ),
  "US onsite incompatible",
);
assert(
  !isLocationCompatible(
    "Remote",
    "Must reside in the United States. No sponsorship.",
  ),
  "US residency incompatible",
);

assert(
  passesPostJdFilter({
    title: "Backend Engineer",
    location: "Remote",
    description: "Build RAG pipelines with LangChain and OpenAI.",
  }),
  "soft title with AI JD passes",
);
assert(
  !passesPostJdFilter({
    title: "Backend Engineer",
    location: "Remote",
    description: "Java microservices on Kubernetes.",
  }),
  "soft title without AI JD fails",
);
assert(
  passesPostJdFilter({
    title: "AI Engineer",
    location: "Remote - Global",
    description: "LLM agents and embeddings.",
  }),
  "hard title remote passes",
);

assert(
  isObviousOnsiteAbroadList("San Francisco - Onsite"),
  "obvious onsite abroad",
);
assert(!isObviousOnsiteAbroadList("Remote - US"), "remote US not obvious drop");

assert(isListableTitle("Software Engineer"), "listable soft");

assert(requiresResidencyAbroad("", "Must reside in the United States"), "residency");

console.log("discovery filter tests passed");
