import type {
  ApiErrorPayload,
  Comment,
  CreateCommentPayload,
  CreateFormPayload,
  LoginResponse,
  UpdateFormPayload,
  User,
  UserForm,
} from "../types/api";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  const detail =
    typeof payload?.detail === "string"
      ? payload.detail
      : payload?.detail?.msg || payload?.meta || `Request failed with status ${response.status}`;

  throw new ApiError(detail, response.status);
}

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  return parseResponse<T>(response);
}

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);

    return request<LoginResponse>("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  },

  async logout(token: string): Promise<void> {
    return request<void>("/auth/logout", { method: "POST" }, token);
  },

  async getMe(token: string): Promise<User> {
    return request<User>("/user/me", undefined, token);
  },

  async getForms(token: string): Promise<UserForm[]> {
    return request<UserForm[]>("/form/forms", undefined, token);
  },

  async getAllForms(token: string): Promise<UserForm[]> {
    return request<UserForm[]>("/form/forms/all", undefined, token);
  },

  async getForm(token: string, formId: string): Promise<UserForm> {
    return request<UserForm>(`/form/forms/${formId}`, undefined, token);
  },

  async createForm(token: string, payload: CreateFormPayload): Promise<UserForm> {
    return request<UserForm>(
      "/form/forms",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async updateForm(token: string, formId: string, payload: UpdateFormPayload): Promise<UserForm> {
    return request<UserForm>(
      `/form/forms/${formId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  async deleteForm(token: string, formId: string): Promise<UserForm> {
    return request<UserForm>(`/form/forms/${formId}`, { method: "DELETE" }, token);
  },

  async getComments(token: string, formId: string): Promise<Comment[]> {
    return request<Comment[]>(`/comments/forms/${formId}/comments`, undefined, token);
  },

  async getPublicForm(formId: string): Promise<UserForm> {
    return request<UserForm>(`/public/${formId}`);
  },

  async createComment(formId: string, payload: CreateCommentPayload): Promise<Comment> {
    return request<Comment>(`/comments/forms/${formId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  publicQrCodeUrl(formId: string): string {
    return `${API_BASE_URL}/public/${formId}/qrcode`;
  },

  publicQrCodeDataUrl(qrcode?: string | null): string | null {
    if (!qrcode) {
      return null;
    }

    return `data:image/png;base64,${qrcode}`;
  },
};
