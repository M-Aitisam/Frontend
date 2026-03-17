/**
 * astToBackendDTO.ts
 * 
 * Transformer utility to convert RuleAst into the exact format
 * that the Flask backend expects (RuleSetPayloadDTO).
 * 
 * Maps frontend RuleAst structure to backend DTO specifications,
 * including payload details for actions from canvas nodes.
 */

import type { RuleAst, ExprNode, ActionNode, TriggerNode } from "./RulesAst";
import type { CanvasNode } from "../types/RulesBuilder";

// ==================== BACKEND DTO TYPES ====================
// These match the Python backend dtos.py definitions

export interface TriggerDTO {
  type: "cron" | "feed_update";
  value: string;
  timezone?: string;
}

export interface ConditionDTO {
  type: "and" | "or" | "compare" | "time";
  children?: ConditionDTO[];
  field?: string;
  op?: ">=" | "<=" | "==" | "!=" | ">" | "<";
  value?: any;
  start_time?: string;
  end_time?: string;
  days?: string;
}

export interface FeedThingDTO {
  type: "feed";
  alias: string;
  platform_name: string;
}

export interface ActuatorThingDTO {
  type: "actuator";
  alias: string;
  platform_name: string;
}

export interface AggregationThingDTO {
  type: "aggregation";
  alias: string;
  source_alias: string;
  duration: string;
  function: string;
}

export type ThingDTO = FeedThingDTO | ActuatorThingDTO | AggregationThingDTO;

export interface SendEmailActionDTO {
  type: "send_email";
  name: string;
  recipient_type: "user" | "group";
  to: string;
  title: string;
  body: string;
}

export interface ToggleRelayActionDTO {
  type: "toggle_relay";
  name: string;
  actuator_alias: string;
  state: "ON" | "OFF" | "true" | "false";
}

export interface GenerateActionDTO {
  type: "generate";
  name: string;
  feed_alias: string;
  value: any;
}

export interface SendNotificationActionDTO {
  type: "send_notification";
  name: string;
  recipient_type: "user" | "group";
  to: string;
  title: string;
  body: string;
}

export interface HttpRequestActionDTO {
  type: "http_request";
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  body?: string;
  headers?: Record<string, string>;
}

export type ActionDTO =
  | SendEmailActionDTO
  | SendNotificationActionDTO
  | ToggleRelayActionDTO
  | GenerateActionDTO
  | HttpRequestActionDTO;

export interface SubRuleDTO {
  id: string;
  name: string;
  when: ConditionDTO;
  then: ActionDTO[];
}

export interface RuleSetPayloadDTO {
  site_id: string;
  rule_name: string;
  rule_description?: string;
  device_id?: string;
  scope: "site" | "device";
  things?: ThingDTO[];
  triggers: TriggerDTO[];
  rules: SubRuleDTO[];
}

// ==================== MAIN TRANSFORMER ====================

/**
 * Main transformer function
 * Converts RuleAst + canvas nodes into the complete RuleSetPayloadDTO
 * ready to send to Flask backend
 * 
 * @param ast - The RuleAst structure from canvasToAst transformer
 * @param canvasNodes - Original canvas nodes for payload details
 * @param siteId - Site identifier (from URL params)
 * @param deviceId - Optional device identifier (if device scope)
 * @param scope - Whether rule is for "site" or "device"
 * @returns RuleSetPayloadDTO ready for backend
 */
export function astToBackendDTO(
  ast: RuleAst,
  canvasNodes: CanvasNode[],
  siteId: string,
  deviceId?: string,
  scope: "site" | "device" = "site",
  ruleName = "Untitled Rule",
  ruleDescription = ""
): RuleSetPayloadDTO {
  // Extract triggers from canvas
  const triggerNodes = canvasNodes.filter((n) => n.kind === "trigger");
  const triggers = ast.triggers?.length
    ? ast.triggers.map((trigger) => triggerNodeToTriggerDTO(trigger))
    : triggerNodes.map((n) => buildTriggerDTO(n));
  const things = buildThingsDTO(canvasNodes);

  // Get action nodes for payload mapping
  const actionNodes = canvasNodes.filter((n) => n.kind === "action");

  // Build the main rule
  const subRule: SubRuleDTO = {
    id: `rule_${Date.now()}`,
    name: ruleName,
    when: exprNodeToConditionDTO(ast.when),
    then: ast.then.map((actionNode) =>
      buildActionDTO(actionNode, actionNodes)
    ),
  };

  return {
    site_id: siteId,
    rule_name: ruleName,
    rule_description: ruleDescription,
    device_id: deviceId,
    scope: scope,
    things: things,
    triggers: triggers,
    rules: [subRule],
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert trigger canvas node to TriggerDTO
 * Handles both cron schedules and feed update triggers
 */
function buildTriggerDTO(node: CanvasNode): TriggerDTO {
  const data = node.data || {};
  const type = data.type || "cron";

  return {
    type: type as "cron" | "feed_update",
    value: data.value || "",
    timezone: data.timezone,
  };
}

function buildThingsDTO(nodes: CanvasNode[]): ThingDTO[] {
  const things = new Map<string, ThingDTO>();

  for (const node of nodes) {
    const data = node.data || {};

    if (node.kind === "trigger" && data.type === "feed_update" && data.value) {
      things.set(`feed:${data.value}`, {
        type: "feed",
        alias: data.value,
        platform_name: data.value,
      });
    }

    if (node.kind === "condition" && data.field) {
      things.set(`feed:${data.field}`, {
        type: "feed",
        alias: data.field,
        platform_name: data.field,
      });
    }

    if (node.kind === "action" && data.type === "toggle_relay" && data.payload?.actuator_alias) {
      const alias = data.payload.actuator_alias;
      things.set(`actuator:${alias}`, {
        type: "actuator",
        alias,
        platform_name: alias,
      });
    }

    if (node.kind === "action" && data.type === "generate" && data.payload?.feed_alias) {
      const alias = data.payload.feed_alias;
      things.set(`feed:${alias}`, {
        type: "feed",
        alias,
        platform_name: alias,
      });
    }
  }

  return Array.from(things.values());
}

/**
 * Recursively convert ExprNode (RuleAst) to ConditionDTO (Backend)
 * Handles AND/OR nodes and compare nodes
 */
function exprNodeToConditionDTO(exprNode: ExprNode): ConditionDTO {
  if (exprNode.type === "and" || exprNode.type === "or") {
    return {
      type: exprNode.type,
      children: exprNode.children.map((child) => exprNodeToConditionDTO(child)),
    };
  }

  if (exprNode.type === "compare") {
    return {
      type: "compare",
      field: exprNode.field,
      op: exprNode.op,
      value: exprNode.value,
    };
  }

  if (exprNode.type === "time") {
    return {
      type: "time",
      start_time: exprNode.start_time,
      end_time: exprNode.end_time,
      days: exprNode.days,
    };
  }

  // Fallback to empty AND
  return {
    type: "and",
    children: [],
  };
}

/**
 * Convert ActionNode (RuleAst) to ActionDTO (Backend)
 * Looks up action canvas node to get payload details (email, relay state, etc.)
 */
function buildActionDTO(
  actionNode: ActionNode,
  actionCanvasNodes: CanvasNode[]
): ActionDTO {
  // Find corresponding canvas node for payload details
  // If multiple actions of same type, we just use the first one
  // (In future, could enhance to match by index or explicit ID)
  const canvasAction = actionCanvasNodes.find(
    (n) => n.data?.type === actionNode.name
  );

  const payload = actionNode.payload || canvasAction?.data?.payload || {};
  const actionType = canvasAction?.data?.type || actionNode.name;

  if (actionType === "send_email") {
    return {
      type: "send_email",
      name: actionNode.name,
      recipient_type: "user",
      to: payload.to || "",
      title: payload.title || "",
      body: payload.body || "",
    };
  }

  if (actionType === "send_notification") {
    return {
      type: "send_notification",
      name: actionNode.name,
      recipient_type: (payload.recipient_type || "user") as "user" | "group",
      to: payload.to || "",
      title: payload.title || "",
      body: payload.body || "",
    };
  }

  if (actionType === "toggle_relay") {
    return {
      type: "toggle_relay",
      name: actionNode.name,
      actuator_alias: payload.actuator_alias || "",
      state: (payload.state || "ON") as "ON" | "OFF" | "true" | "false",
    };
  }

  if (actionType === "http_request") {
    return {
      type: "http_request",
      name: actionNode.name,
      method: (payload.method || "POST") as "GET" | "POST" | "PUT" | "DELETE",
      url: payload.url || "",
      body: payload.body,
      headers: payload.headers,
    };
  }

  return {
    type: "generate",
    name: actionNode.name,
    feed_alias: payload.feed_alias || "",
    value: payload.value,
  };
}

function triggerNodeToTriggerDTO(triggerNode: TriggerNode): TriggerDTO {
  if (triggerNode.type === "feed_update") {
    return {
      type: "feed_update",
      value: triggerNode.value,
    };
  }

  return {
    type: "cron",
    value: triggerNode.value,
    timezone: triggerNode.timezone,
  };
}

/**
 * Optional utility: Validate payload based on action type
 * Ensures required fields are present for each action type
 */
export function validateActionPayload(
  actionType: string,
  payload: Record<string, any>
): boolean {
  switch (actionType) {
    case "send_email":
      return !!(payload.to && payload.title && payload.body);
    case "toggle_relay":
      return !!(payload.actuator_alias && payload.state);
    case "generate":
      return !!(payload.feed_alias && payload.value !== undefined);
    default:
      return false;
  }
}
