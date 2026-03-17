import * as React from "react";
import { Box, Paper, Stack, Typography, TextField } from "@mui/material";

type Props = {
  title: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  topContent?: React.ReactNode;
  maxWidth?: number;
  searchLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export default function PageShell({
  title,
  children,
  actions,
  topContent,
  maxWidth = 900,
  searchLabel,
  searchValue,
  onSearchChange,
}: Props) {
  const showSearch = Boolean(searchLabel && onSearchChange);

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#f6f7fb", p: 2 }}>
      <Paper elevation={3} sx={{ maxWidth, mx: "auto", p: 3 }}>
        {topContent}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>

          {actions && (
            <Stack direction="row" spacing={1} sx={{ ml: { sm: "auto" } }}>
              {actions}
            </Stack>
          )}
        </Stack>

        {showSearch && (
          <TextField
            fullWidth
            label={searchLabel}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        {children}
      </Paper>
    </Box>
  );
}