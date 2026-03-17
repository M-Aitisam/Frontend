import type { RuleAst } from "../utils/RulesAst";

export type RuleStatus = "active" | "inactive";

export type BuilderSupportLevel = "current" | "partial" | "future";

export type RuleThing =
  | {
      type: "feed";
      alias: string;
      platform_name: string;
    }
  | {
      type: "actuator";
      alias: string;
      platform_name: string;
    }
  | {
      type: "aggregation";
      alias: string;
      source_alias: string;
      duration: string;
      function: string;
    };

export type RuleTrigger =
  | {
      type: "cron";
      value: string;
      timezone?: string;
    }
  | {
      type: "feed_update";
      value: string;
    };

export type RuleConditionDefinition =
  | {
      type: "compare";
      field: string;
      op: ">=" | "<=" | "==" | "!=" | ">" | "<";
      value: string | number | boolean;
    }
  | {
      type: "and" | "or";
      children: RuleConditionDefinition[];
    }
  | {
      type: "time";
      start_time: string;
      end_time: string;
      days: string;
    };

export type RuleActionDefinition =
  | {
      type: "send_email";
      name: string;
      recipient_type: "user" | "group";
      to: string;
      title: string;
      body: string;
    }
  | {
      type: "send_notification";
      name: string;
      recipient_type: "user" | "group";
      to: string;
      title: string;
      body: string;
    }
  | {
      type: "toggle_relay";
      name: string;
      actuator_alias: string;
      state: "ON" | "OFF" | "true" | "false";
    }
  | {
      type: "generate";
      name: string;
      feed_alias: string;
      value: string | number | boolean;
    }
  | {
      type: "http_request";
      name: string;
      method: "GET" | "POST" | "PUT" | "DELETE";
      url: string;
      body?: string;
      headers?: Record<string, string>;
    };

export type RuleDefinition = {
  things?: RuleThing[];
  triggers: RuleTrigger[];
  when: RuleConditionDefinition;
  then: RuleActionDefinition[];
};

export type Rule = {
  id: string;
  name: string;
  deviceId: string;
  siteId?: string;
  status: RuleStatus;
  description?: string;

  // Old/simple representation:
  conditions?: string[];
  actions?: string[];

  // New structured representation:
  ast?: RuleAst;
  definition?: RuleDefinition;

  // Editing roadmap metadata:
  builderSupport?: BuilderSupportLevel;
  coverageTags?: string[];
  notes?: string[];

  createdAt?: string;
  lastTriggeredAt?: string | null;
};

export const RULES: Rule[] = [
  {
    id: "rule_dev1_temp",
    name: "Sensor X Temperature Check",
    deviceId: "dev_1",
    siteId: "north-quarry",
    status: "active",
    description: "Trigger on temperature updates when temp > 75°C for 3 mins and notify ops by email",
    conditions: ["temp > 75", "duration >= 180s"],
    actions: ["send_email"],
    createdAt: "2025-01-10T09:00:00Z",
    lastTriggeredAt: "2025-02-01T04:15:00Z",
    builderSupport: "partial",
    coverageTags: [
      "feed_update_trigger",
      "and_condition",
      "compare_condition",
      "send_email_action",
    ],
    notes: [
      "Good first round-trip candidate once trigger loading is added.",
      "Current builder can recover the compare nodes but not the trigger payload yet.",
    ],
    ast: {
      when: {
        type: "and",
        children: [
          { type: "compare", field: "temp", op: ">", value: 75 },
          { type: "compare", field: "duration", op: ">=", value: 180 },
        ],
      },
      then: [
        { type: "action", name: "send_email" },
      ],
    },
    definition: {
      things: [
        {
          type: "feed",
          alias: "temp",
          platform_name: "temperature_sensor_main",
        },
      ],
      triggers: [{ type: "feed_update", value: "temp" }],
      when: {
        type: "and",
        children: [
          { type: "compare", field: "temp", op: ">", value: 75 },
          { type: "compare", field: "duration", op: ">=", value: 180 },
        ],
      },
      then: [
        {
          type: "send_email",
          name: "notify_ops",
          recipient_type: "group",
          to: "ops-team@quarry.test",
          title: "High temperature on Sensor X",
          body: "Temperature stayed above 75C for 3 minutes.",
        },
      ],
    },
  },

  {
    id: "rule_dev1_on",
    name: "Shift Start Notification",
    deviceId: "dev_1",
    siteId: "north-quarry",
    status: "active",
    description: "At the start of each weekday shift, send a notification to the maintenance group",
    conditions: ["time is between 06:00 and 18:00 on weekdays"],
    actions: ["send_notification"],
    createdAt: "2025-01-12T11:00:00Z",
    lastTriggeredAt: null,
    builderSupport: "future",
    coverageTags: [
      "cron_trigger",
      "time_condition",
      "send_notification_action",
    ],
    notes: [
      "Useful future test case for time windows.",
      "Builder does not support send_notification or time conditions yet.",
    ],
    definition: {
      triggers: [{ type: "cron", value: "0 6 * * 1-5", timezone: "Australia/Sydney" }],
      when: {
        type: "time",
        start_time: "06:00",
        end_time: "18:00",
        days: "Mon-Fri",
      },
      then: [
        {
          type: "send_notification",
          name: "notify_shift_start",
          recipient_type: "group",
          to: "maintenance-team",
          title: "Shift started",
          body: "Monitoring rules are now active for the day shift.",
        },
      ],
    },
  },

  {
    id: "rule_dev2_vibration",
    name: "High Vibration Webhook",
    deviceId: "dev_2",
    siteId: "north-quarry",
    status: "inactive",
    description: "When RMS vibration exceeds 6 mm/s for 60s, send a webhook to the incident API",
    conditions: ["vibration_rms > 6", "duration >= 60s"],
    actions: ["http_request"],
    createdAt: "2025-01-09T08:20:00Z",
    lastTriggeredAt: "2025-01-21T13:02:00Z",
    builderSupport: "future",
    coverageTags: [
      "feed_update_trigger",
      "compare_condition",
      "http_request_action",
    ],
    notes: [
      "Based on the backend HTTP request action support.",
      "Good future regression case for preserving headers and request body.",
    ],
    definition: {
      things: [
        {
          type: "feed",
          alias: "vibration_rms",
          platform_name: "vibration_rms",
        },
      ],
      triggers: [{ type: "feed_update", value: "vibration_rms" }],
      when: {
        type: "and",
        children: [
          { type: "compare", field: "vibration_rms", op: ">", value: 6 },
          { type: "compare", field: "duration", op: ">=", value: 60 },
        ],
      },
      then: [
        {
          type: "http_request",
          name: "open_incident_webhook",
          method: "POST",
          url: "https://ops.example.test/incidents",
          body: '{"severity":"high","source":"dev_2_vibration"}',
          headers: {
            Authorization: "Bearer demo-token",
            "Content-Type": "application/json",
          },
        },
      ],
    },
  },

  {
    id: "rule_dev5_soil",
    name: "Soil Moisture Low",
    deviceId: "dev_5",
    siteId: "east-farm",
    status: "active",
    description: "Every 10 minutes, if moisture is below 18%, open the irrigation relay",
    conditions: ["moisture < 18"],
    actions: ["toggle_relay"],
    createdAt: "2025-01-05T10:00:00Z",
    lastTriggeredAt: "2025-02-04T06:40:00Z",
    builderSupport: "partial",
    coverageTags: [
      "cron_trigger",
      "compare_condition",
      "toggle_relay_action",
    ],
    notes: [
      "Builder UI already has a relay editor, but saved-rule loading still needs payload reconstruction.",
    ],
    definition: {
      things: [
        {
          type: "feed",
          alias: "moisture",
          platform_name: "soil_moisture_sensor",
        },
        {
          type: "actuator",
          alias: "irrigation_valve",
          platform_name: "irrigation_valve",
        },
      ],
      triggers: [{ type: "cron", value: "*/10 * * * *", timezone: "UTC" }],
      when: {
        type: "compare",
        field: "moisture",
        op: "<",
        value: 18,
      },
      then: [
        {
          type: "toggle_relay",
          name: "start_irrigation",
          actuator_alias: "irrigation_valve",
          state: "ON",
        },
      ],
    },
  },

  {
    id: "rule_dev5_pump",
    name: "Pump Offline Notification",
    deviceId: "dev_5",
    siteId: "east-farm",
    status: "inactive",
    description: "If the pump heartbeat is missed for 5 minutes, notify the field operators",
    conditions: ["heartbeat_missed >= 5m"],
    actions: ["send_notification"],
    createdAt: "2025-01-08T10:00:00Z",
    lastTriggeredAt: null,
    builderSupport: "future",
    coverageTags: [
      "feed_update_trigger",
      "legacy_duration_condition",
      "send_notification_action",
    ],
    notes: [
      "Useful future case for non-numeric duration parsing and recovery.",
    ],
    definition: {
      triggers: [{ type: "feed_update", value: "heartbeat_missed" }],
      when: {
        type: "compare",
        field: "heartbeat_missed",
        op: ">=",
        value: "5m",
      },
      then: [
        {
          type: "send_notification",
          name: "notify_pump_offline",
          recipient_type: "group",
          to: "field-operators",
          title: "Pump heartbeat missing",
          body: "The irrigation pump has not reported for at least 5 minutes.",
        },
      ],
    },
  },

  {
    id: "rule_dev7_wind",
    name: "Wind Gust Advisory",
    deviceId: "dev_7",
    siteId: "harbor-bridge",
    status: "active",
    description: "When gust speed exceeds 90 km/h or humidity drops below 20%, send a warning email",
    conditions: ["wind_gust > 90", "humidity < 20"],
    actions: ["send_email"],
    createdAt: "2025-01-02T09:00:00Z",
    lastTriggeredAt: "2025-02-02T03:12:00Z",
    builderSupport: "future",
    coverageTags: [
      "feed_update_trigger",
      "or_condition",
      "send_email_action",
    ],
    notes: [
      "Good future test case for OR groups and additional feed fields.",
    ],
    definition: {
      triggers: [{ type: "feed_update", value: "wind_gust" }],
      when: {
        type: "or",
        children: [
          { type: "compare", field: "wind_gust", op: ">", value: 90 },
          { type: "compare", field: "humidity", op: "<", value: 20 },
        ],
      },
      then: [
        {
          type: "send_email",
          name: "notify_bridge_ops",
          recipient_type: "group",
          to: "bridge-ops@test",
          title: "Weather advisory",
          body: "Wind gust or humidity threshold exceeded on the bridge site.",
        },
      ],
    },
  },

  {
    id: "rule_dev5_generate_irrigation_score",
    name: "Generate Irrigation Score",
    deviceId: "dev_5",
    siteId: "east-farm",
    status: "active",
    description: "When soil moisture stays below 20%, generate a derived irrigation score",
    conditions: ["moisture < 20"],
    actions: ["generate"],
    createdAt: "2025-02-10T07:30:00Z",
    lastTriggeredAt: null,
    builderSupport: "partial",
    coverageTags: [
      "feed_update_trigger",
      "compare_condition",
      "generate_action",
    ],
    notes: [
      "Good sample for generate action payload reconstruction.",
    ],
    definition: {
      things: [
        {
          type: "feed",
          alias: "moisture",
          platform_name: "soil_moisture_sensor",
        },
        {
          type: "feed",
          alias: "irrigation_score",
          platform_name: "irrigation_score",
        },
      ],
      triggers: [{ type: "feed_update", value: "moisture" }],
      when: {
        type: "compare",
        field: "moisture",
        op: "<",
        value: 20,
      },
      then: [
        {
          type: "generate",
          name: "emit_irrigation_score",
          feed_alias: "irrigation_score",
          value: 1,
        },
      ],
    },
  },
];
