// src/components/RuleNodeCard.tsx
/**
 * RuleNodeCard Component
 *
 * Displays a single rule block (node) on the canvas with two modes:
 * - View Mode: Shows block info, clickable to edit
 * - Edit Mode: Expandable form to configure block parameters
 *
 * Supports configuration for:
 * - Trigger blocks (cron expressions, feed updates)
 * - Condition blocks (field comparisons)
 * - Action blocks (email, relay toggles, data generation)
 */

import * as React from "react";
import {
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { CanvasNode } from "../../types/RulesBuilder";

// ─── Shared sx overrides for MUI fields on dark gradient backgrounds ──────────
// Without these, labels and borders are nearly invisible on dark cards.
const darkFieldSx = {
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.65)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.55)" },
    "&.Mui-focused fieldset": { borderColor: "white" },
  },
  // Colour the Select dropdown arrow icon
  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.8)" },
};

// MUI Select menu paper rendered in portal — must match dark theme
const darkMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: "#0f1f4b",
      color: "white",
      "& .MuiMenuItem-root:hover": {
        backgroundColor: "rgba(255,255,255,0.1)",
      },
      "& .MuiMenuItem-root.Mui-selected": {
        backgroundColor: "rgba(255,255,255,0.15)",
      },
    },
  },
};

export default function RuleNodeCard({
  node,
  onRemove,
  onUpdate,
}: {
  node: CanvasNode;
  onRemove: () => void;
  onUpdate?: (updatedNode: CanvasNode) => void;
}) {
  // State management for edit mode toggle and form data
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState(node.data || {});

  // Handler to save configuration changes and exit edit mode
  const handleSave = () => {
    if (onUpdate) {
      onUpdate({ ...node, data: formData });
    }
    setIsEditing(false);
  };

  // Handler to discard changes and exit edit mode
  const handleCancel = () => {
    setFormData(node.data || {});
    setIsEditing(false);
  };

  // Get gradient colors based on node kind — matches canvas dark theme
  const getNodeGradient = () => {
    if (node.kind === "trigger")
      return "linear-gradient(135deg, #00d084 0%, #00a86b 100%)";
    if (node.kind === "condition")
      return "linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)";
    if (node.kind === "action")
      return "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)";
    return "linear-gradient(135deg, #00d084 0%, #00a86b 100%)";
  };

  // ─── EDIT MODE ───────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 2,
          background: "linear-gradient(135deg, #0f1f4b 0%, #1a2f6e 100%)",
          color: "white",
          boxShadow: "0 10px 40px rgba(10, 15, 46, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <Stack spacing={2}>
          {/* Header showing block kind and label */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={node.kind}
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
            <Typography fontWeight={700} fontSize={14}>
              Configure {node.label}
            </Typography>
          </Stack>

          {/* ── TRIGGER CONFIGURATION FORM ───────────────────────────────── */}
          {node.kind === "trigger" && (
            <Stack spacing={1.5}>
              <FormControl fullWidth size="small" sx={darkFieldSx}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type || "cron"}
                  label="Type"
                  MenuProps={darkMenuProps}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <MenuItem value="cron">Cron</MenuItem>
                  <MenuItem value="feed_update">Feed Update</MenuItem>
                </Select>
              </FormControl>

              {/* Cron trigger — schedule expression + optional timezone */}
              {(formData.type === "cron" || !formData.type) && (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cron Expression"
                    placeholder="0 9 * * *"
                    value={formData.value || ""}
                    sx={darkFieldSx}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Timezone (optional)"
                    placeholder="UTC"
                    value={formData.timezone || ""}
                    sx={darkFieldSx}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                  />
                </>
              )}

              {/* Feed update trigger — monitor changes on a specific feed */}
              {formData.type === "feed_update" && (
                <TextField
                  fullWidth
                  size="small"
                  label="Feed Alias"
                  placeholder="temperature"
                  value={formData.value || ""}
                  sx={darkFieldSx}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                />
              )}
            </Stack>
          )}

          {/* ── CONDITION CONFIGURATION FORM ─────────────────────────────── */}
          {node.kind === "condition" && (
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                label="Field"
                placeholder="temp, humidity, duration..."
                value={formData.field || ""}
                sx={darkFieldSx}
                onChange={(e) =>
                  setFormData({ ...formData, field: e.target.value })
                }
              />
              <FormControl fullWidth size="small" sx={darkFieldSx}>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={formData.op || ">"}
                  label="Operator"
                  MenuProps={darkMenuProps}
                  onChange={(e) =>
                    setFormData({ ...formData, op: e.target.value })
                  }
                >
                  <MenuItem value=">">Greater than (&gt;)</MenuItem>
                  <MenuItem value="<">Less than (&lt;)</MenuItem>
                  <MenuItem value=">=">Greater or equal (&gt;=)</MenuItem>
                  <MenuItem value="<=">Less or equal (&lt;=)</MenuItem>
                  <MenuItem value="==">Equal (==)</MenuItem>
                  <MenuItem value="!=">Not equal (!=)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                size="small"
                label="Value"
                type="number"
                value={formData.value || ""}
                sx={darkFieldSx}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </Stack>
          )}

          {/* ── ACTION CONFIGURATION FORM ────────────────────────────────── */}
          {node.kind === "action" && (
            <Stack spacing={1.5}>
              <FormControl fullWidth size="small" sx={darkFieldSx}>
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={formData.type || "send_email"}
                  label="Action Type"
                  MenuProps={darkMenuProps}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <MenuItem value="send_email">Send Email</MenuItem>
                  <MenuItem value="toggle_relay">Toggle Relay</MenuItem>
                  <MenuItem value="generate">Generate</MenuItem>
                </Select>
              </FormControl>

              {/* Send Email — recipient, subject, body */}
              {(formData.type === "send_email" || !formData.type) && (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    value={formData.payload?.to || ""}
                    sx={darkFieldSx}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payload: { ...formData.payload, to: e.target.value },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Subject"
                    value={formData.payload?.title || ""}
                    sx={darkFieldSx}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payload: {
                          ...formData.payload,
                          title: e.target.value,
                        },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Body"
                    multiline
                    rows={2}
                    value={formData.payload?.body || ""}
                    sx={darkFieldSx}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payload: { ...formData.payload, body: e.target.value },
                      })
                    }
                  />
                </>
              )}

              {/* Toggle Relay — actuator alias + ON/OFF state */}
              {formData.type === "toggle_relay" && (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    label="Actuator Alias"
                    value={formData.payload?.actuator_alias || ""}
                    sx={darkFieldSx}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payload: {
                          ...formData.payload,
                          actuator_alias: e.target.value,
                        },
                      })
                    }
                  />
                  <FormControl fullWidth size="small" sx={darkFieldSx}>
                    <InputLabel>State</InputLabel>
                    <Select
                      value={formData.payload?.state || "ON"}
                      label="State"
                      MenuProps={darkMenuProps}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payload: {
                            ...formData.payload,
                            state: e.target.value,
                          },
                        })
                      }
                    >
                      <MenuItem value="ON">ON</MenuItem>
                      <MenuItem value="OFF">OFF</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              {/* Generate — feed alias + numeric value */}
              {formData.type === "generate" && (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    label="Feed Alias"
                    value={formData.payload?.feed_alias || ""}
                    sx={darkFieldSx}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payload: {
                          ...formData.payload,
                          feed_alias: e.target.value,
                        },
                      })
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Value"
                    type="number"
                    value={formData.payload?.value || ""}
                    sx={darkFieldSx}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payload: { ...formData.payload, value: e.target.value },
                      })
                    }
                  />
                </>
              )}
            </Stack>
          )}

          {/* Save / Cancel buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              onClick={handleCancel}
              sx={{
                color: "rgba(255,255,255,0.85)",
                borderColor: "rgba(255,255,255,0.3)",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.6)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.85)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(76, 175, 80, 1)" },
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  // ─── VIEW MODE ───────────────────────────────────────────────────────────────
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        background: getNodeGradient(),
        color: "white",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 48px rgba(102, 126, 234, 0.5)",
        },
      }}
      onClick={() => setIsEditing(true)}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip
          label={node.kind}
          size="small"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontWeight: 600,
          }}
        />
        <Typography fontWeight={700}>{node.label}</Typography>

        {/* "configured" badge — shown when block has saved data */}
        {node.data && Object.keys(node.data).length > 0 && (
          <Chip
            label="configured"
            size="small"
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "rgba(76, 175, 80, 0.6)",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
            }}
          />
        )}

        {/* Remove button — stopPropagation prevents entering edit mode */}
        <Button
          sx={{
            ml: "auto",
            color: "rgba(255,255,255,0.85)",
            "&:hover": {
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          Remove
        </Button>
      </Stack>
    </Paper>
  );
}