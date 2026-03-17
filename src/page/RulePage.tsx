/**
 * Third_page.tsx (Rules Page)
 * 
 * Rules management page for a specific site.
 * Displays all rules associated with a particular site and provides functionality
 * to view, manage, and create new rules.
 * 
 * Features:
 * - Display rules for the selected site
 * - Breadcrumb navigation for site context
 * - Add new rule functionality
 * - Rule cards showing rule details
 * - Handle missing site gracefully with error message
 * - Navigation back to sites list
 */

import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid } from "@mui/material";
import BreadcrumbsNav from "../components/pagesComponents/BreadcrumbsNav";
import PageShell from "../components/pagesComponents/PageShell";
import { SITES_BY_ID } from "../data/SiteData";
import { RULES } from "../data/RulesData";
import RuleCard from "../components/pagesComponents/RuleCard";

export default function RulePage() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const site = siteId ? SITES_BY_ID[siteId] : undefined;

  if (!site) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Site not found</Typography>
        <Button onClick={() => navigate("/sites")}>Back to Sites</Button>
      </Box>
    );
  }

  const siteRules = RULES.filter((r) => r.siteId === site.id);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRules = siteRules.filter((rule) => {
    if (!normalizedQuery) {
      return true;
    }

    return [
      rule.name,
      rule.deviceId,
      rule.description,
      ...(rule.conditions ?? []),
      ...(rule.actions ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <PageShell
      title={`${site.name} - Rules`}
      topContent={<BreadcrumbsNav />}
      actions={
        <>
          <Button onClick={() => navigate("/sites")}>Back</Button>
          <Button onClick={() => navigate(`/sites/${site.id}/generate-rule`)}>
            +
          </Button>
        </>
      }
      searchLabel="Search rules"
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {siteRules.length === 0 ? (
        <Typography color="text.secondary">No rules for this site.</Typography>
      ) : filteredRules.length === 0 ? (
        <Typography color="text.secondary">
          No rules match your search.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredRules.map((rule) => (
            <Grid key={rule.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <RuleCard
                rule={rule}
                onClick={() =>
                  navigate(`/sites/${site.id}/generate-rule/${rule.id}`)
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </PageShell>
  );
}
