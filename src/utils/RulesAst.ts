export type CompareOp = ">" | ">=" | "<" | "<=" | "==" | "!=";

export type FieldName = string;

export type ConditionValue = string | number | boolean;

export type CompareNode = {
  type: "compare";
  field: FieldName;
  op: CompareOp;
  value: ConditionValue;
};

export type TimeNode = {
  type: "time";
  start_time: string;
  end_time: string;
  days: string;
};

export type ConditionNode = CompareNode | TimeNode | AndNode | OrNode;

export type AndNode = { type: "and"; children: ConditionNode[] };
export type OrNode = { type: "or"; children: ConditionNode[] };

export type ExprNode = ConditionNode;

export type TriggerNode = CronTriggerNode | FeedUpdateTriggerNode;

export type CronTriggerNode = {
  type: "cron";
  value: string;
  timezone?: string;
};

export type FeedUpdateTriggerNode = {
  type: "feed_update";
  value: string;
};

export type ActionName =
  | "send_email"
  | "send_notification"
  | "toggle_relay"
  | "generate"
  | "http_request";

export type ActionPayload =
  | {
      recipient_type: "user" | "group";
      to: string;
      title: string;
      body: string;
    }
  | {
      actuator_alias: string;
      state: "ON" | "OFF" | "true" | "false";
    }
  | {
      feed_alias: string;
      value: ConditionValue;
    }
  | {
      method: "GET" | "POST" | "PUT" | "DELETE";
      url: string;
      body?: string;
      headers?: Record<string, string>;
    };

export type ActionNode = {
  type: "action";
  name: ActionName;
  payload?: ActionPayload;
};

export type RuleAst = {
  triggers?: TriggerNode[];
  when: ExprNode;
  then: ActionNode[];
};
