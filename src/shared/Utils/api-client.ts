import { notification } from "antd";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || localStorage.getItem("baseUrl") || "";

type RequestConfig = {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  baseUrl?: string;
  shouldHideError?: boolean;
  isFormData?: boolean; // if true, body is FormData
  responseType?: "json" | "blob" | "arraybuffer" | "text";
};

function buildQuery(params?: Record<string, any>) {
  if (!params) return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((x) => usp.append(k, String(x)));
    else usp.append(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

function showErr(msg: string, hide?: boolean) {
  if (!hide) notification.error({ message: msg });
}

let isRedirectingToLogin = false;

function redirectToLoginOn401(msg: string) {
  if (isRedirectingToLogin) return;

  isRedirectingToLogin = true;

  const slug = window.location.pathname.split("/").filter(Boolean)[0];

  localStorage.clear();

  notification.error({ message: msg });

  window.location.replace(slug ? `/${slug}/login` : "/login");
}

async function request(
  method: string,
  endpoint: string,
  body?: any,
  config: RequestConfig = {},
) {
  const baseUrl = config.baseUrl || BASE_URL;
  if (!baseUrl) throw new Error("BASE_URL missing");

  const token = localStorage.getItem("token");

  // current tenant slug from url
  const pathname = window.location.pathname;
  const slug = pathname.split("/")[1] || "";
  const tenantId = localStorage.getItem("tenantId");

  const headers: Record<string, string> = {
    ...(config.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (slug) headers["x-tenant-slug"] = slug;

  if (tenantId) headers["x-tenant-id"] = tenantId;

  // JSON default unless FormData
  if (!config.isFormData) headers["Content-Type"] = "application/json";

  const url = baseUrl + endpoint + buildQuery(config.params);

  const res = await fetch(url, {
    method,
    headers,
    body:
      body === undefined
        ? undefined
        : config.isFormData
          ? body
          : JSON.stringify(body),
  });

  // 204
  if (res.status === 204) {
    return { status: 204, data: null, headers: res.headers, url: res.url };
  }

  let data: any = null;

  try {
    switch (config.responseType) {
      case "blob":
        data = await res.blob();
        break;
      case "arraybuffer":
        data = await res.arrayBuffer();
        break;
      case "text":
        data = await res.text();
        break;
      case "json":
      default: {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = await res.text();
        }
        break;
      }
    }
  } catch {
    data = null;
  }

  // auth/permission handling
  if (res.status === 401) {
    const hasToken = Boolean(localStorage.getItem("token"));

    const msg = hasToken
      ? "Session expired. Please login again."
      : "Please login to continue.";

    console.error("401 API =>", url, data);

    redirectToLoginOn401(msg);

    throw Object.assign(new Error(msg), { status: 401, data });
  }

  if (res.status === 403) {
    showErr(data?.message || "Forbidden", config.shouldHideError);
    throw new Error(data?.message || "Forbidden");
  }

  if (!res.ok) {
    const msg =
      data?.message || data?.error || res.statusText || "Request failed";

    const err: any = new Error(msg);
    err.status = res.status;
    err.data = data;

    showErr(msg, config.shouldHideError);
    throw err;
  }

  // axios-like
  return { status: res.status, data, headers: res.headers, url: res.url };
}

export const Client = {
  get: (endpoint: string, config?: RequestConfig) =>
    request("GET", endpoint, undefined, config),

  post: (endpoint: string, body?: any, config?: RequestConfig) =>
    request("POST", endpoint, body, config),

  put: (endpoint: string, body?: any, config?: RequestConfig) =>
    request("PUT", endpoint, body, config),

  patch: (endpoint: string, body?: any, config?: RequestConfig) =>
    request("PATCH", endpoint, body, config),

  delete: (endpoint: string, config?: RequestConfig) =>
    request("DELETE", endpoint, undefined, config),
};
