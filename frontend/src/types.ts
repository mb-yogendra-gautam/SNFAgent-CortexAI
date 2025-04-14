export interface Message {
  role: "user" | "assistant";
  content: ContentItem[];
  request_id?: string;
}

export interface ContentItem {
  type: "text" | "sql" | "suggestions";
  text?: string;
  statement?: string;
  results?: any[];
  error?: string;
  suggestions?: string[];
}

export interface ChatResponse {
  content: ContentItem[];
  request_id: string;
}
