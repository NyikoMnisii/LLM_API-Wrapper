export type ChatRole = "user" | "model";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatPayload {
  message: string;
  history: ChatMessage[];
  latitude?: number;
  longitude?: number;
}

export interface AgronomistResponse {
  analysis: string;
  recommendations: string[];
  sustainability_note: string;
  is_farming_related: boolean;
}

export type WeatherStatus = "SUCCESS" | "REQUIRES_CLARIFICATION" | "ERROR";

export interface WeatherForecast {
  status: WeatherStatus;
  reason: string | null;
  resolved_location: string | null;
  dates: string[];
  min_temperatures_celsius: number[];
  max_temperatures_celsius: number[];
  total_precipitation_mm: number[];
  frost_warning: boolean;
  high_humidity_fungal_risk: boolean;
}

export interface ApiErrorBody {
  error: string;
}
