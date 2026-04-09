export type Timestamp = number | string;

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name?: string | null;
  password: string;
}

export interface User {
  id: string;
  email: string;
  phone: number | null;
  first_name: string | null;
  last_name: string | null;
  tg_account: string | null;
  tg_username: string | null;
  tg_notify_enabled: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  usercode: string | null;
  avatar_key: string | null;
  notify_email_enabled: boolean;
  notify_email: string | null;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export interface UserForm {
  id: string;
  title: string;
  user_id: string;
  description: string | null;
  is_enabled: boolean;
  qrcode?: string | null;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export interface Comment {
  id: string;
  first_name: string | null;
  last_name: string | null;
  title: string;
  description: string;
  phone: number | null;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export interface ApiErrorPayload {
  detail?: string | { msg?: string };
  meta?: string;
}

export interface CreateFormPayload {
  title: string;
  description: string;
}

export interface UpdateFormPayload {
  title?: string;
  description?: string;
}

export interface CreateCommentPayload {
  first_name?: string;
  last_name?: string;
  title: string;
  description: string;
  phone?: number;
}

export interface UpdateUserPayload {
  email?: string;
  phone?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  tg_account?: string | null;
  tg_username?: string | null;
  tg_notify_enabled?: boolean;
  notify_email_enabled?: boolean;
  notify_email?: string | null;
}
