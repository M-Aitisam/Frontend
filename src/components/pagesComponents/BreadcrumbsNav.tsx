import * as React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { SITES_BY_ID } from "../../data/SiteData";

function titleCase(s: string) {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BreadcrumbsNav() {
  const location = useLocation();
  const { siteId } = useParams();
  const currentSiteId = siteId ?? null;

  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
      {pathnames.map((seg, idx) => {
        const to = "/" + pathnames.slice(0, idx + 1).join("/");
        const isLast = idx === pathnames.length - 1;
        const isSiteSegment = currentSiteId !== null && seg === currentSiteId;

        let label = titleCase(seg);

        // Replace siteId in URL with real site name
        if (isSiteSegment) {
          label = SITES_BY_ID[currentSiteId]?.name ?? label;
        }

        // Don't make site ID or last segment clickable
        const shouldBeLink = !isLast && !isSiteSegment && seg !== "devices" && seg !== "generate-rule";
        
        return shouldBeLink ? (
          <Link
            key={to}
            component={RouterLink}
            to={to}
            underline="hover"
            color="inherit"
          >
            {label}
          </Link>
        ) : (
          <Typography key={to} color="text.primary">
            {label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
