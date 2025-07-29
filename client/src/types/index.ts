export interface DashboardMetrics {
  activeAlerts: number;
  criticalAlerts: number;
  avgMTTD: number;
  avgMTTR: number;
  falsePositiveRate: number;
}

export interface WebSocketMessage {
  type: "new_alert" | "alert_updated" | "new_investigation" | "new_comment" | "new_chat_messages";
  data: any;
}

export interface AlertFilters {
  severity?: string;
  status?: string;
  assignee?: string;
}
