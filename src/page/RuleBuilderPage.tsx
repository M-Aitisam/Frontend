/**
 * RuleBuilder_page.tsx
 * 
 * Rule Builder page component for creating and editing rules.
 * Provides a visual interface with a palette of rule blocks and a canvas for
 * composing rules by dragging and dropping blocks. Users can build complex rule
 * logic by connecting different rule components.
 * 
 * Features:
 * - Rule block palette for selecting available rule types
 * - Canvas for visual rule composition via drag-and-drop
 * - Add/remove rule nodes dynamically
 * - Site context navigation via URL parameters
 */

import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Divider,
  TextField,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import RulePalette from "../components/RuleBuilderComponents/RulePalette";
import RuleCanvas from "../components/RuleBuilderComponents/RuleCanvas";
import { RULES } from "../data/RulesData";
import type { CanvasNode, PaletteBlock } from "../types/RulesBuilder";
import { canvasNodesToRuleAst } from "../utils/canvasToAst";
import { astToBackendDTO } from "../utils/astToBackendDTO";
import { ruleToCanvasNodes } from "../utils/ruleToCanvasNodes";
import { SITES_BY_ID } from "../data/SiteData";
import { post } from "../net/http";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function RuleBuilderPage() {
  const navigate = useNavigate();
  const { siteId, ruleId } = useParams();
  const site = siteId ? SITES_BY_ID[siteId] : undefined;
  const existingRule = ruleId
    ? RULES.find((rule) => rule.id === ruleId && rule.siteId === siteId)
    : undefined;

  const [nodes, setNodes] = React.useState<CanvasNode[]>([]);
  const [ruleName, setRuleName] = React.useState("");
  const [ruleDescription, setRuleDescription] = React.useState("");
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [compiledDSL, setCompiledDSL] = React.useState<string | null>(null);
  const [compileError, setCompileError] = React.useState<string | null>(null);
  const [loadWarnings, setLoadWarnings] = React.useState<string[]>([]);

  React.useEffect(() => {
    setCompiledDSL(null);
    setCompileError(null);

    if (!ruleId) {
      setNodes([]);
      setRuleName("");
      setRuleDescription("");
      setLoadWarnings([]);
      return;
    }

    if (!existingRule) {
      setNodes([]);
      setRuleName("");
      setRuleDescription("");
      setLoadWarnings([]);
      setCompileError("The selected rule could not be found.");
      return;
    }

    const loadResult = ruleToCanvasNodes(existingRule);
    setNodes(loadResult.nodes);
    setRuleName(existingRule.name);
    setRuleDescription(existingRule.description || "");
    setLoadWarnings(loadResult.warnings);
  }, [existingRule, ruleId]);

  const handleDropBlock = (block: PaletteBlock & { data?: any }) => {
    setNodes((prev) => [
      ...prev,
      { id: `n_${makeId()}`, kind: block.kind, label: block.label, data: block.data || {} },
    ]);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNode = (updatedNode: CanvasNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompileError(null);
    setCompiledDSL(null);

    try {
      // Validate that blocks have configuration
      const unconfiguredBlocks = nodes.filter(
        (n) => !n.data || Object.keys(n.data).length === 0
      );
      if (unconfiguredBlocks.length > 0) {
        throw new Error(
          `${unconfiguredBlocks.length} block(s) need configuration before compiling`
        );
      }

      // Ensure we have at least some blocks
      if (nodes.length === 0) {
        throw new Error("Add at least one block before compiling");
      }

      if (!site) {
        throw new Error("Rule builder is missing a valid site context");
      }

      if (!ruleName.trim()) {
        throw new Error("Enter a rule name before compiling");
      }

      // Step 1: Transform canvas nodes to RuleAst
      const ast = canvasNodesToRuleAst(nodes);

      // Step 2: Transform RuleAst to Backend DTO
      const dto = astToBackendDTO(
        ast,
        nodes,
        site.backendSiteId,
        undefined,
        "site",
        ruleName.trim(),
        ruleDescription.trim()
      );

      // Step 3: Send to backend
      const response = await fetch("https://yuxr9sytdf.execute-api.ap-southeast-2.amazonaws.com/dev/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      const data = await response.json();

      if (data.success) {
        setCompiledDSL(data.ruleDsl);
      } else {
        setCompileError(data.error || "Backend compilation failed");
      }
    } catch (error) {
      setCompileError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#f6f7fb", p: 2 }}>
      <Paper elevation={3} sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
        <Stack direction="row" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>
            {existingRule ? "Edit Rule" : "Rule Builder"} {site ? `• ${site.name}` : ""}
          </Typography>
          <Button
            sx={{ ml: "auto" }}
            onClick={() => navigate(site ? `/sites/${site.id}/devices` : "/sites")}
          >
            Back
          </Button>
        </Stack>

        <Stack spacing={2} mb={3}>
          <TextField
            fullWidth
            label="Rule Name"
            placeholder="Daily_Avg_Temp_Monitor"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Rule Description"
            placeholder="Describe what this rule does"
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
          />
        </Stack>

        {loadWarnings.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={700} mb={0.5}>
              Existing rule loaded with some limitations
            </Typography>
            <Typography variant="body2">
              {loadWarnings.join(" ")}
            </Typography>
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <RulePalette />
          <RuleCanvas
            nodes={nodes}
            onDropBlock={handleDropBlock}
            onRemoveNode={removeNode}
            onUpdateNode={updateNode}
          />
        </Stack>

        {/* Compile Section */}
        <Divider sx={{ my: 3 }} />
        <Stack spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={handleCompile}
            disabled={isCompiling || nodes.length === 0}
            startIcon={isCompiling ? <CircularProgress size={20} /> : undefined}
            sx={{ alignSelf: "flex-start" }}
          >
            {isCompiling ? "Compiling..." : "Compile Rule"}
          </Button>

          {/* Error Display */}
          {compileError && (
            <Alert severity="error" onClose={() => setCompileError(null)}>
              <Typography variant="body2" fontWeight={700}>
                Compilation Error
              </Typography>
              <Typography variant="body2">{compileError}</Typography>
            </Alert>
          )}

          {/* Success - DSL Output */}
          {compiledDSL && !compileError && (
            <Alert severity="success">
              <Typography variant="body2" fontWeight={700} mb={1}>
                ✓ Rule Compiled Successfully
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#f5f5f5",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {compiledDSL}
              </Paper>
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
