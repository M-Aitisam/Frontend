import type {
  Rule,
  RuleTrigger,
} from "../data/RulesData";
import type { CanvasNode } from "../types/RulesBuilder";
import type { ConditionNode, TriggerNode } from "./RulesAst";

export type RuleCanvasLoadResult = {
  nodes: CanvasNode[];
  warnings: string[];
};

const SUPPORTED_ACTION_TYPES = new Set([
  "send_email",
  "toggle_relay",
  "generate",
]);

function titleCase(value: string) {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function makeNodeId(ruleId: string, kind: string, index: number) {
  return `${ruleId}_${kind}_${index + 1}`;
}

function getNumericPrefix(value: string) {
  const match = value.trim().match(/^-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseConditionText(condition: string) {
  const match = condition.match(/^\s*([a-zA-Z_][\w]*)\s*(>=|<=|==|!=|>|<)\s*(.+?)\s*$/);
  if (!match) {
    return null;
  }

  const [, field, op, rawValue] = match;
  const numericValue = getNumericPrefix(rawValue);
  if (numericValue === null) {
    return null;
  }

  return {
    label: `${field} ${op} ${rawValue}`,
    data: {
      field,
      op,
      value: String(numericValue),
    },
  };
}

function buildUnsupportedNode(
  ruleId: string,
  kind: "trigger" | "condition" | "action",
  index: number,
  label: string
): CanvasNode {
  return {
    id: makeNodeId(ruleId, kind, index),
    kind,
    label,
    data: {},
  };
}

function buildTriggerCanvasNodes(
  ruleId: string,
  definitionTriggers?: RuleTrigger[],
  astTriggers?: TriggerNode[]
): CanvasNode[] {
  const triggers = definitionTriggers?.length ? definitionTriggers : astTriggers ?? [];

  return triggers.map((trigger, index) => {
    if (trigger.type === "feed_update") {
      return {
        id: makeNodeId(ruleId, "trigger", index),
        kind: "trigger",
        label: `Feed: ${trigger.value}`,
        data: {
          type: "feed_update",
          value: trigger.value,
        },
      };
    }

    return {
      id: makeNodeId(ruleId, "trigger", index),
      kind: "trigger",
      label: `Cron: ${trigger.value}`,
      data: {
        type: "cron",
        value: trigger.value,
        timezone: "timezone" in trigger ? trigger.timezone : undefined,
      },
    };
  });
}

function buildSupportedActionNode(
  ruleId: string,
  index: number,
  action: { name: string; payload?: unknown }
): CanvasNode {
  return {
    id: makeNodeId(ruleId, "action", index),
    kind: "action",
    label: titleCase(action.name),
    data: {
      type: action.name,
      payload: action.payload,
    },
  };
}

function flattenConditionNodes(
  conditionNode: ConditionNode,
  ruleId: string,
  warnings: string[],
  nextIndex: { value: number }
): CanvasNode[] {
  if (conditionNode.type === "and" || conditionNode.type === "or") {
    if (conditionNode.type === "or") {
      warnings.push(
        'This rule uses an "or" condition group. The current builder still loads the leaf conditions as separate blocks.'
      );
    }

    return conditionNode.children.flatMap((child) =>
      flattenConditionNodes(child, ruleId, warnings, nextIndex)
    );
  }

  if (conditionNode.type === "time") {
    warnings.push(
      "Time window conditions are not directly editable in the builder yet and were added as placeholders."
    );

    const index = nextIndex.value;
    nextIndex.value += 1;

    return [
      buildUnsupportedNode(
        ruleId,
        "condition",
        index,
        `Time: ${conditionNode.start_time}-${conditionNode.end_time} (${conditionNode.days})`
      ),
    ];
  }

  const index = nextIndex.value;
  nextIndex.value += 1;

  return [
    {
      id: makeNodeId(ruleId, "condition", index),
      kind: "condition",
      label: `${conditionNode.field} ${conditionNode.op} ${conditionNode.value}`,
      data: {
        field: conditionNode.field,
        op: conditionNode.op,
        value: String(conditionNode.value),
      },
    },
  ];
}

export function ruleToCanvasNodes(rule: Rule): RuleCanvasLoadResult {
  const warnings: string[] = [];

  if (rule.definition) {
    const triggerNodes = buildTriggerCanvasNodes(rule.id, rule.definition.triggers);
    const conditionNodes = flattenConditionNodes(rule.definition.when, rule.id, warnings, {
      value: 0,
    });

    const actionNodes = rule.definition.then.map((action, index) => {
      if (SUPPORTED_ACTION_TYPES.has(action.type)) {
        return buildSupportedActionNode(rule.id, index, {
          name: action.type,
          payload: action,
        });
      }

      warnings.push(
        `Action "${action.type}" is not directly editable in the builder yet.`
      );

      return buildUnsupportedNode(
        rule.id,
        "action",
        index,
        `Unsupported action: ${titleCase(action.type)}`
      );
    });

    return {
      nodes: [...triggerNodes, ...conditionNodes, ...actionNodes],
      warnings,
    };
  }

  if (rule.ast) {
    const triggerNodes = buildTriggerCanvasNodes(rule.id, undefined, rule.ast.triggers);
    const conditionNodes = flattenConditionNodes(rule.ast.when, rule.id, warnings, {
      value: 0,
    });

    const actionNodes = rule.ast.then.map((action, index) => {
      if (SUPPORTED_ACTION_TYPES.has(action.name)) {
        return buildSupportedActionNode(rule.id, index, action);
      }

      warnings.push(
        `Action "${action.name}" is not directly editable in the builder yet.`
      );

      return buildUnsupportedNode(
        rule.id,
        "action",
        index,
        `Unsupported action: ${titleCase(action.name)}`
      );
    });

    return {
      nodes: [...triggerNodes, ...conditionNodes, ...actionNodes],
      warnings,
    };
  }

  warnings.push(
    "This rule uses the legacy flat format, so some details may need manual cleanup in the builder."
  );

  const conditionNodes = (rule.conditions ?? []).map((condition, index) => {
    const parsed = parseConditionText(condition);
    if (parsed) {
      return {
        id: makeNodeId(rule.id, "condition", index),
        kind: "condition" as const,
        label: parsed.label,
        data: parsed.data,
      };
    }

    warnings.push(
      `Condition "${condition}" could not be converted exactly and was added as a placeholder.`
    );

    return buildUnsupportedNode(
      rule.id,
      "condition",
      index,
      `Unsupported condition: ${condition}`
    );
  });

  const actionNodes = (rule.actions ?? []).map((action, index) => {
    if (SUPPORTED_ACTION_TYPES.has(action)) {
      return {
        id: makeNodeId(rule.id, "action", index),
        kind: "action" as const,
        label: titleCase(action),
        data: {
          type: action,
        },
      };
    }

    warnings.push(
      `Action "${action}" could not be converted exactly and was added as a placeholder.`
    );

    return buildUnsupportedNode(
      rule.id,
      "action",
      index,
      `Unsupported action: ${titleCase(action)}`
    );
  });

  return {
    nodes: [...conditionNodes, ...actionNodes],
    warnings,
  };
}