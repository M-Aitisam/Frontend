/**
 * Second_page.tsx (Sites Page)
 * 
 * Main dashboard page displaying all available sites for the user.
 * Allows users to browse, search, and navigate to specific sites to manage
 * devices and create rules within those sites.
 * 
 * Features:
 * - Display list of available sites as cards
 * - Search functionality to filter sites
 * - Navigation to site details (devices view)
 * - Sign out functionality
 */

import * as React from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";

import PageShell from "../components/pagesComponents/PageShell";
import { SITES } from "../data/SiteData";
import SiteCard from "../components/pagesComponents/SiteCard";

export default function SitePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredSites = SITES.filter((site) => {
    if (!normalizedQuery) {
      return true;
    }

    return [site.name, site.backendSiteId, ...site.rules.map((rule) => rule.name)]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <PageShell
      title="Your Sites"
      searchLabel="Search"
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {filteredSites.length === 0 ? (
        <Typography color="text.secondary">
          No sites match your search.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredSites.map((site) => (
            <Grid key={site.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <SiteCard
                site={site}
                onOpen={() => navigate(`/sites/${site.id}/devices`)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </PageShell>
  );
}
