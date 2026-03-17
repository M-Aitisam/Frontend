import * as React from "react";
import { Paper, Typography, Button, Stack, Box, Chip } from "@mui/material";
import type { Site } from "../../data/SiteData";

type Props = {
  site: Site;
  onOpen?: () => void;
};

export default function SiteCard({
  site,
  onOpen,
}: Props) {
  const firstRule = site.rules?.[0];

  const handleOpen = () => {
    onOpen?.();
  };

  return (
    <Paper
      onClick={onOpen ? handleOpen : undefined}
      sx={{
        p: 3,
        borderRadius: 3,
        cursor: onOpen ? "pointer" : "default",
        background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
        color: "white",
        boxShadow: "0 12px 40px rgba(0, 212, 255, 0.25)",
        border: "1.5px solid rgba(255, 255, 255, 0.2)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "relative",
        overflow: "hidden",
        minHeight: "220px",
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
        "&:hover": onOpen ? {
          transform: "translateY(-12px) scale(1.02)",
          boxShadow: "0 20px 60px rgba(0, 212, 255, 0.4)",
          background: "linear-gradient(135deg, #00c4ff 0%, #0088aa 100%)",
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
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          pointerEvents: "none",
        }}
      />

      {/* Header section */}
      <Stack direction="row" alignItems="flex-start" spacing={2} mb={2.5}>
        <Box sx={{ flex: 1 }}>
          <Typography
            fontWeight={800}
            variant="h5"
            sx={{
              fontSize: "1.5rem",
              letterSpacing: "-0.5px",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
            }}
          >
            {site.name}
          </Typography>
        </Box>
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Active
        </Box>
      </Stack>

      {/* Statistics section */}
      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {/* Devices stat */}
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)",
            borderRadius: "10px",
            padding: "12px 14px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.18)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              📱
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: "0.85rem" }}>
                Devices
              </Typography>
              <Typography fontWeight={700} sx={{ fontSize: "1.1rem" }}>
                {site.deviceCount}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Rules stat */}
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)",
            borderRadius: "10px",
            padding: "12px 14px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.18)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              ⚙️
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: "0.85rem" }}>
                Rules
              </Typography>
              <Typography fontWeight={700} sx={{ fontSize: "1.1rem" }}>
                {site.rules.length}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* First rule preview */}
        {firstRule && (
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "10px",
              padding: "10px 12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              marginTop: "auto !important",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.75, display: "block", mb: 0.5 }}>
              Latest Rule
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {firstRule.name}
            </Typography>
          </Box>
        )}
      </Stack>

      {/* Action button */}
      <Stack direction="row" spacing={1} mt={2.5}>
        <Button
          fullWidth
          size="small"
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
          sx={{
            background: "rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(10px)",
            color: "white",
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: "0.8rem",
            letterSpacing: "0.5px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            },
          }}
        >
          Explore
        </Button>
      </Stack>
    </Paper>
  );
}
