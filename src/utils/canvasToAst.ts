/**
 * canvasToAst.ts
 * 
 * Transformer utility to convert flat canvas nodes into a nested RuleAst structure.
 * This bridges the UI-level canvas representation with the AST structure needed
 * for backend compilation.
 */

import type { CanvasNode } from "../types/RulesBuilder";
import type {
  RuleAst,
  ExprNode,
  CompareNode,
  ConditionNode,
  ActionNode,
  ActionName,
  CompareOp,
  FieldName,
  TriggerNode,
} from "./RulesAst";

/**
 * Main transformer function
 * Converts a flat list of canvas nodes into a nested RuleAst structure
 * 
 * @param nodes - Array of configured canvas nodes
 * @returns RuleAst with nested condition tree and actions
 */
export function canvasNodesToRuleAst(nodes: CanvasNode[]): RuleAst {
  const triggerNodes = nodes.filter((n) => n.kind === "trigger");
  // Separate nodes by kind
  const conditionNodes = nodes.filter((n) => n.kind === "condition");
  const actionNodes = nodes.filter((n) => n.kind === "action");

  // Build the condition tree (when clause)
  // If no conditions, default to an empty AND node
  let whenTree: ExprNode;
  if (conditionNodes.length === 0) {
    whenTree = { type: "and", children: [] };
  } else if (conditionNodes.length === 1) {
    whenTree = buildConditionNode(conditionNodes[0]);
  } else {
    // Multiple conditions: combine with AND by default
    // (User can later configure AND/OR via UI)
    const conditionTreeNodes = conditionNodes.map((n) => buildConditionNode(n));
    whenTree = { type: "and", children: conditionTreeNodes };
  }

  // Build action nodes (then clause)
  const thenActions = actionNodes.map((n) => buildActionNode(n));

  return {
    triggers: triggerNodes.map((n) => buildTriggerNode(n)),
    when: whenTree,
    then: thenActions,
  };
}

/**
 * Convert a single condition canvas node to a condition AST node.
 */
function buildConditionNode(node: CanvasNode): ConditionNode {
  const data = node.data || {};

  if (data.type === "time" || data.start_time || data.end_time || data.days) {
    return {
      type: "time",
      start_time: data.start_time || "00:00",
      end_time: data.end_time || "23:59",
      days: data.days || "Mon-Sun",
    };
  }

  return {
    type: "compare",
    field: (data.field || "temp") as FieldName,
    op: (data.op || ">") as CompareOp,
    value: parseConditionValue(data.value),
  };
}

function parseConditionValue(value: unknown) {
  if (typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return 0;
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  const numericValue = Number(trimmed);
  if (!Number.isNaN(numericValue) && trimmed.match(/^-?\d+(?:\.\d+)?$/)) {
    return numericValue;
  }

  return trimmed;
}

function buildTriggerNode(node: CanvasNode): TriggerNode {
  const data = node.data || {};

  if (data.type === "feed_update") {
    return {
      type: "feed_update",
      value: data.value || "",
    };
  }

  return {
    type: "cron",
    value: data.value || "",
    timezone: data.timezone,
  };
}

/**
 * Convert a single action canvas node to an ActionNode
 * Extracts the action type from node.data
 */
function buildActionNode(node: CanvasNode): ActionNode {
  const data = node.data || {};
  const actionType = data.type || "send_email";

  return {
    type: "action",
    name: actionType as ActionName,
    payload: data.payload,
  };
}

/**
 * Optional: Combine multiple ExprNodes with a logical operator
 * Useful if user selects AND/OR between condition groups
 */
export function combineExpressions(
  expressions: ExprNode[],
  operator: "and" | "or"
): ExprNode {
  if (expressions.length === 0) {
    return { type: "and", children: [] };
  }
  if (expressions.length === 1) {
    return expressions[0];
  }

  // Flatten all children if combining same type
  const allChildren: ConditionNode[] = [];
  for (const expr of expressions) {
    if (expr.type === operator) {
      allChildren.push(...expr.children);
    } else {
      allChildren.push(expr);
    }
  }

  return {
    type: operator,
    children: allChildren,
  };
}
