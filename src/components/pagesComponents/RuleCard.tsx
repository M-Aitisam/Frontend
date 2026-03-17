import * as React from "react";
import { Paper, Typography, Chip, Stack, Box } from "@mui/material";
import type { Rule } from "../../data/RulesData";

type Props = {
  rule: Rule;
  actions?: React.ReactNode;
  onClick?: () => void;
};

function getRuleSummary(rule: Rule) {
  return (
    rule.description ||
    `IF ${(rule.conditions ?? []).join(" AND ") || "-"} THEN ${
      (rule.actions ?? []).join(", ") || "-"
    }`
  );
}

function getStatusColor(status: Rule["status"]) {
  return status === "active" ? "success" : "default";
}

export default function RuleCard({ rule, actions, onClick }: Props) {
  const summary = getRuleSummary(rule);

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        background: "linear-gradient(135deg, #1e90ff 0%, #0047ab 100%)",
        color: "white",
        boxShadow: "0 12px 40px rgba(30, 144, 255, 0.25)",
        border: "1.5px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
        },
        "&:hover": onClick ? {
          transform: "translateY(-10px) scale(1.02)",
          boxShadow: "0 20px 60px rgba(30, 144, 255, 0.4)",
          background: "linear-gradient(135deg, #1873cc 0%, #003d82 100%)",
          border: "1.5px solid rgba(255, 255, 255, 0.4)",
        } : undefined,
      }}
    >
      {/* Decorative background element */}
      <Box
        sx={{
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          pointerEvents: "none",
        }}
      />

      {/* Header with title and status */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
        <Typography
          fontWeight={800}
          variant="h6"
          sx={{
            fontSize: "1.1rem",
            letterSpacing: "-0.3px",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
            flex: 1,
          }}
        >
          {rule.name}
        </Typography>
        <Chip
          label={rule.status}
          size="small"
          variant={rule.status === "active" ? "filled" : "outlined"}
          sx={{
            backgroundColor: rule.status === "active" ? "rgba(76, 175, 80, 0.95)" : "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            border: rule.status === "active" ? "none" : "1.5px solid rgba(255, 255, 255, 0.3)",
          }}
        />
      </Stack>

      {/* Device info */}
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          📱 {rule.deviceId}
        </Typography>
      </Box>

      {/* Summary section */}
      <Box
        sx={{
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(8px)",
          borderRadius: "10px",
          padding: "10px 12px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          flex: 1,
          marginBottom: "auto",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "0.85rem",
            lineHeight: 1.4,
            maxHeight: "3.6em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {summary}
        </Typography>
      </Box>

      {/* Action buttons */}
      {actions && (
        <Stack direction="row" spacing={1} mt={2}>
          {actions}
        </Stack>
      )}
    </Paper>
  );
}
