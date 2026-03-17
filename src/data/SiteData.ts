import { RULES } from "./RulesData";

export type RuleStatus = "active" | "inactive";
export type Rule = { id: string; name: string; status: RuleStatus };

export type Site = {
  id: string;
  backendSiteId: string;
  name: string;
  deviceCount: number;
  rules: Rule[];
};

const SITE_METADATA: Omit<Site, "rules">[] = [
  {
    id: "north-quarry",
    backendSiteId: "20236",
    name: "North Quarry",
    deviceCount: 3,
  },
  {
    id: "east-farm",
    backendSiteId: "20237",
    name: "East Farm",
    deviceCount: 5,
  },
  {
    id: "harbor-bridge",
    backendSiteId: "20238",
    name: "Harbor Bridge",
    deviceCount: 2,
  },
];

export const SITES: Site[] = SITE_METADATA.map((site) => ({
  ...site,
  rules: RULES.filter((rule) => rule.siteId === site.id).map((rule) => ({
    id: rule.id,
    name: rule.name,
    status: rule.status,
  })),
}));

export const SITES_BY_ID: Record<string, Site> = SITES.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {} as Record<string, Site>);
