// src/components/RuleCanvas.tsx
import * as React from "react";
import { Paper, Typography, Stack, Box } from "@mui/material";
import type { CanvasNode, PaletteBlock } from "../../types/RulesBuilder";
import RuleNodeCard from "./RuleNodeCard";

type Props = {
  nodes: CanvasNode[];
  onDropBlock: (block: PaletteBlock) => void;
  onRemoveNode: (id: string) => void;
  onUpdateNode?: (node: CanvasNode) => void;
};

export default function RuleCanvas({
  nodes,
  onDropBlock,
  onRemoveNode,
  onUpdateNode,
}: Props) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the canvas itself, not a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const raw = e.dataTransfer.getData("application/rule-block");
    if (!raw) return;
    const block = JSON.parse(raw) as PaletteBlock;
    onDropBlock(block);
  };

  return (
    <Paper
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        p: 2.5,
        borderRadius: 3,
        flex: 1,
        minHeight: 420,
        background: isDragOver
          ? "linear-gradient(135deg, #0f1f4b 0%, #1a2f6e 100%)"
          : "linear-gradient(135deg, #0a0f2e 0%, #121a45 100%)",
        border: isDragOver
          ? "2px dashed rgba(102, 126, 234, 0.8)"
          : "2px dashed rgba(255, 255, 255, 0.12)",
        transition: "all 0.25s ease",
        boxShadow: isDragOver
          ? "0 0 32px rgba(102, 126, 234, 0.25) inset"
          : "none",
      }}
    >
      {/* Header */}
      <Typography
        fontWeight={800}
        fontSize={16}
        mb={0.5}
        sx={{ color: "white", letterSpacing: 0.5 }}
      >
        Canvas
      </Typography>
      <Typography variant="body2" mb={2.5} sx={{ color: "rgba(255,255,255,0.45)" }}>
        Drop blocks here to build your rule.
      </Typography>

      <Stack spacing={1.5}>
        {nodes.length === 0 ? (
          // Empty state — shown while no blocks are on the canvas
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: 2,
              gap: 1,
            }}
          >
            <Typography fontSize={32}>⬇️</Typography>
            <Typography
              sx={{
                color: isDragOver
                  ? "rgba(102, 126, 234, 0.9)"
                  : "rgba(255,255,255,0.3)",
                fontWeight: 600,
                fontSize: 13,
                transition: "color 0.2s",
              }}
            >
              {isDragOver ? "Release to add block" : "No blocks yet — drag one here"}
            </Typography>
          </Box>
        ) : (
          nodes.map((n) => (
            <RuleNodeCard
              key={n.id}
              node={n}
              onRemove={() => onRemoveNode(n.id)}
              onUpdate={onUpdateNode}
            />
          ))
        )}
      </Stack>
    </Paper>
  );
}