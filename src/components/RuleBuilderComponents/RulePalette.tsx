// src/components/RulePalette.tsx
import * as React from "react";
import { Paper, Typography, Stack, Chip, Button, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { PALETTE_BLOCKS } from "../../data/RuleBlocks";
import type { PaletteBlock } from "../../types/RulesBuilder";

export default function RulePalette() {
  // Local state for palette blocks
  const [blocks, setBlocks] = React.useState(
    PALETTE_BLOCKS.map((b) => ({ ...b, data: {} }))
  );
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState<any>({});

  // Drag handler
  const onDragStart = (e: React.DragEvent, idx: number) => {
    const block = blocks[idx];
    e.dataTransfer.setData("application/rule-block", JSON.stringify(block));
    e.dataTransfer.effectAllowed = "copy";
  };

  // Compute dynamic label
  function getBlockLabel(block: PaletteBlock & { data?: any }) {
    if (block.kind === "condition" && block.data && block.data.field && block.data.op && block.data.value) {
      return `${block.data.field} ${block.data.op} ${block.data.value}`;
    }
    if (block.kind === "trigger" && block.data && block.data.type) {
      if (block.data.type === "cron" && block.data.value) {
        return `Cron: ${block.data.value}`;
      }
      if (block.data.type === "feed_update" && block.data.value) {
        return `Feed: ${block.data.value}`;
      }
    }
    if (block.kind === "action" && block.data && block.data.type) {
      if (block.data.type === "send_email" && block.data.payload?.to) {
        return `Email: ${block.data.payload.to}`;
      }
      if (block.data.type === "toggle_relay" && block.data.payload?.actuator_alias) {
        return `Relay: ${block.data.payload.actuator_alias}`;
      }
      if (block.data.type === "generate" && block.data.payload?.feed_alias) {
        return `Generate: ${block.data.payload.feed_alias}`;
      }
    }
    return block.label;
  }

  // Save handler
  const handleSave = () => {
    if (editingIdx !== null) {
      const updated = [...blocks];
      updated[editingIdx] = {
        ...updated[editingIdx],
        data: formData,
      };
      setBlocks(updated);
      setEditingIdx(null);
      setFormData({});
    }
  };

  // Cancel handler
  const handleCancel = () => {
    setEditingIdx(null);
    setFormData({});
  };

  // Edit handler
  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setFormData(blocks[idx].data || {});
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 3, width: { xs: "100%", md: 320 } }}>
      <Typography fontWeight={800} mb={1}>
        Palette
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Drag blocks into the canvas.
      </Typography>

      <Stack spacing={1}>
        {blocks.map((b, idx) => (
          editingIdx === idx ? (
            <Paper key={b.id} sx={{ p: 2, borderRadius: 2, bgcolor: "#f5f5f5" }}>
              <Stack spacing={2}>
                <Typography fontWeight={700} fontSize={14}>
                  Configure {b.label}
                </Typography>
                {/* Condition config */}
                {b.kind === "condition" && (
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Field"
                      value={formData.field || ""}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={formData.op || ">"}
                        label="Operator"
                        onChange={(e) => setFormData({ ...formData, op: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                  </Stack>
                )}
                {/* Trigger config */}
                {b.kind === "trigger" && (
                  <Stack spacing={1.5}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={formData.type || "cron"}
                        label="Type"
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <MenuItem value="cron">Cron</MenuItem>
                        <MenuItem value="feed_update">Feed Update</MenuItem>
                      </Select>
                    </FormControl>
                    {formData.type === "cron" && (
                      <>
                        <TextField
                          fullWidth
                          size="small"
                          label="Cron Expression"
                          value={formData.value || ""}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Timezone (optional)"
                          value={formData.timezone || ""}
                          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        />
                      </>
                    )}
                    {formData.type === "feed_update" && (
                      <TextField
                        fullWidth
                        size="small"
                        label="Feed Alias"
                        value={formData.value || ""}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      />
                    )}
                  </Stack>
                )}
                {/* Action config */}
                {b.kind === "action" && (
                  <Stack spacing={1.5}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Action Type</InputLabel>
                      <Select
                        value={formData.type || "send_email"}
                        label="Action Type"
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <MenuItem value="send_email">Send Email</MenuItem>
                        <MenuItem value="toggle_relay">Toggle Relay</MenuItem>
                        <MenuItem value="generate">Generate</MenuItem>
                      </Select>
                    </FormControl>
                    {formData.type === "send_email" && (
                      <>
                        <TextField
                          fullWidth
                          size="small"
                          label="Email"
                          value={formData.payload?.to || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            payload: { ...formData.payload, to: e.target.value },
                          })}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Subject"
                          value={formData.payload?.title || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            payload: { ...formData.payload, title: e.target.value },
                          })}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Body"
                          multiline
                          rows={2}
                          value={formData.payload?.body || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            payload: { ...formData.payload, body: e.target.value },
                          })}
                        />
                      </>
                    )}
                    {formData.type === "toggle_relay" && (
                      <>
                        <TextField
                          fullWidth
                          size="small"
                          label="Actuator Alias"
                          value={formData.payload?.actuator_alias || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            payload: { ...formData.payload, actuator_alias: e.target.value },
                          })}
                        />
                        <FormControl fullWidth size="small">
                          <InputLabel>State</InputLabel>
                          <Select
                            value={formData.payload?.state || "ON"}
                            label="State"
                            onChange={(e) => setFormData({
                              ...formData,
                              payload: { ...formData.payload, state: e.target.value },
                            })}
                          >
                            <MenuItem value="ON">ON</MenuItem>
                            <MenuItem value="OFF">OFF</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    )}
                    {formData.type === "generate" && (
                      <>
                        <TextField
                          fullWidth
                          size="small"
                          label="Feed Alias"
                          value={formData.payload?.feed_alias || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            payload: { ...formData.payload, feed_alias: e.target.value },
                          })}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Value"
                          type="number"
                          value={formData.payload?.value || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            payload: { ...formData.payload, value: e.target.value },
                          })}
                        />
                      </>
                    )}
                  </Stack>
                )}
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={handleCancel}>Cancel</Button>
                  <Button size="small" variant="contained" onClick={handleSave}>Save</Button>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Chip
              key={b.id}
              label={`${b.kind.toUpperCase()}: ${getBlockLabel(b)}`}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              sx={{ justifyContent: "flex-start", borderRadius: 2, py: 2 }}
              onClick={() => handleEdit(idx)}
            />
          )
        ))}
      </Stack>
    </Paper>
  );
}
