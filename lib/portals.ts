import type { DiscoveryPortal, PortalSource, ProfileSummary } from "./types";

export type { PortalSource };
export type Portal = DiscoveryPortal;

export {
  isIndiaCompatible,
  isListableTitle,
  isLocationCompatible,
  isObviousOnsiteAbroadList,
  isPoorFitJob,
  isTargetTitle,
  passesListStage,
  passesPostJdFilter,
} from "./discovery-filters";

/** Built-in boards (demo Applied AI / tech set). Override via profile.discovery. */
export const DEFAULT_PORTALS: Portal[] = [
  // India-first (Greenhouse)
  { name: "Razorpay", source: "greenhouse", board: "razorpay" },
  { name: "PhonePe", source: "greenhouse", board: "phonepe" },
  { name: "CRED", source: "greenhouse", board: "cred" },
  { name: "Groww", source: "greenhouse", board: "groww" },
  { name: "Meesho", source: "greenhouse", board: "meesho" },
  { name: "Paytm", source: "greenhouse", board: "paytm" },
  { name: "Swiggy", source: "greenhouse", board: "swiggy" },
  { name: "Zomato", source: "greenhouse", board: "zomato" },
  { name: "Zerodha", source: "greenhouse", board: "zerodha" },
  { name: "Unacademy", source: "greenhouse", board: "unacademy" },
  { name: "FourKites", source: "greenhouse", board: "fourkites" },
  { name: "ConnectWise", source: "greenhouse", board: "connectwise" },
  { name: "Apex IT", source: "greenhouse", board: "apexit" },
  { name: "Particle41", source: "greenhouse", board: "particle41llc" },
  { name: "Postman", source: "greenhouse", board: "postman" },
  { name: "BrowserStack", source: "greenhouse", board: "browserstack" },
  { name: "Whatfix", source: "greenhouse", board: "whatfix" },
  { name: "ThoughtSpot", source: "greenhouse", board: "thoughtspot" },
  { name: "Chargebee", source: "greenhouse", board: "chargebee" },
  { name: "Freshworks", source: "greenhouse", board: "freshworks" },
  { name: "Sprinklr", source: "greenhouse", board: "sprinklr" },
  // Global product / infra (Greenhouse)
  { name: "Atlassian", source: "greenhouse", board: "atlassian" },
  { name: "MongoDB", source: "greenhouse", board: "mongodb" },
  { name: "Databricks", source: "greenhouse", board: "databricks" },
  { name: "LangChain", source: "greenhouse", board: "langchain" },
  { name: "Glean", source: "greenhouse", board: "glean" },
  { name: "Rippling", source: "greenhouse", board: "rippling" },
  { name: "Elastic", source: "greenhouse", board: "elastic" },
  { name: "OpenAI", source: "greenhouse", board: "openai" },
  { name: "Anthropic", source: "greenhouse", board: "anthropic" },
  { name: "Perplexity", source: "greenhouse", board: "perplexity" },
  { name: "Cohere", source: "greenhouse", board: "cohere" },
  { name: "Scale AI", source: "greenhouse", board: "scaleai" },
  { name: "Weights & Biases", source: "greenhouse", board: "wandb" },
  { name: "Together AI", source: "greenhouse", board: "togetherai" },
  { name: "Replicate", source: "greenhouse", board: "replicate" },
  { name: "Anyscale", source: "greenhouse", board: "anyscale" },
  { name: "Runway", source: "greenhouse", board: "runway" },
  { name: "Notion", source: "greenhouse", board: "notion" },
  { name: "Discord", source: "greenhouse", board: "discord" },
  { name: "Stripe", source: "greenhouse", board: "stripe" },
  { name: "Datadog", source: "greenhouse", board: "datadog" },
  { name: "Snowflake", source: "greenhouse", board: "snowflake" },
  { name: "Confluent", source: "greenhouse", board: "confluent" },
  { name: "ServiceNow", source: "greenhouse", board: "servicenow" },
  { name: "HashiCorp", source: "greenhouse", board: "hashicorp" },
  { name: "Cloudflare", source: "greenhouse", board: "cloudflare" },
  { name: "Shopify", source: "greenhouse", board: "shopify" },
  { name: "HubSpot", source: "greenhouse", board: "hubspot" },
  { name: "Asana", source: "greenhouse", board: "asana" },
  { name: "Airtable", source: "greenhouse", board: "airtable" },
  { name: "Amplitude", source: "greenhouse", board: "amplitude" },
  // Ashby
  { name: "n8n", source: "ashby", board: "n8n" },
  { name: "ElevenLabs", source: "ashby", board: "elevenlabs" },
  { name: "Hugging Face", source: "ashby", board: "huggingface" },
  { name: "Cursor", source: "ashby", board: "cursor" },
  { name: "Replit", source: "ashby", board: "replit" },
  { name: "Linear", source: "ashby", board: "linear" },
  { name: "Retool", source: "ashby", board: "retool" },
  { name: "Supabase", source: "ashby", board: "supabase" },
  { name: "Modal", source: "ashby", board: "modal" },
  { name: "Fireworks AI", source: "ashby", board: "fireworks" },
  { name: "Pinecone", source: "ashby", board: "pinecone" },
  { name: "AssemblyAI", source: "ashby", board: "assemblyai" },
  { name: "Harvey", source: "ashby", board: "harvey" },
  { name: "Ramp", source: "ashby", board: "ramp" },
  { name: "Vercel", source: "ashby", board: "vercel" },
  { name: "OpenRouter", source: "ashby", board: "openrouter" },
  { name: "Cognition", source: "ashby", board: "cognition" },
  { name: "Sierra", source: "ashby", board: "sierra" },
  // Lever
  { name: "Figma", source: "lever", board: "figma" },
  { name: "Spotify", source: "lever", board: "spotify" },
  { name: "Palantir", source: "lever", board: "palantir" },
  { name: "Coursera", source: "lever", board: "coursera" },
  { name: "Docker", source: "lever", board: "docker" },
  { name: "Dropbox", source: "lever", board: "dropbox" },
  { name: "Netflix", source: "lever", board: "netflix" },
  { name: "Lyft", source: "lever", board: "lyft" },
  { name: "Affirm", source: "lever", board: "affirm" },
  { name: "Plaid", source: "lever", board: "plaid" },
];

/** @deprecated Prefer resolvePortals(profile) — kept for import-job board name lookup. */
export const PORTALS = DEFAULT_PORTALS;

export function resolvePortals(profile?: ProfileSummary | null): Portal[] {
  const discovery = profile?.discovery;
  const extras = discovery?.portals ?? [];
  if (discovery?.replaceDefaultPortals) {
    return extras.length > 0 ? extras : DEFAULT_PORTALS;
  }
  if (extras.length === 0) return DEFAULT_PORTALS;
  const seen = new Set(
    DEFAULT_PORTALS.map((portal) => `${portal.source}:${portal.board}`),
  );
  const merged = [...DEFAULT_PORTALS];
  for (const portal of extras) {
    const key = `${portal.source}:${portal.board}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(portal);
  }
  return merged;
}
