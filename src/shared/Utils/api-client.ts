import { notification } from "antd";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || localStorage.getItem("baseUrl") || "";

type RequestConfig = {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  baseUrl?: string;
  shouldHideError?: boolean;
  isFormData?: boolean;
  responseType?: "json" | "blob" | "arraybuffer" | "text";
};

function buildQuery(params?: Record<string, any>) {
  if (!params) return "";

  const usp = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;

    if (Array.isArray(v)) {
      v.forEach((x) => usp.append(k, String(x)));
    } else {
      usp.append(k, String(v));
    }
  });

  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

function showErr(msg: string, hide?: boolean) {
  if (!hide) {
    notification.error({ message: msg });
  }
}

function getTenantSlugFromUrl() {
  return window.location.pathname.split("/").filter(Boolean)[0] || "";
}

function isLoginRequest(endpoint: string) {
  return (
    endpoint.includes("/auth/login") ||
    endpoint.includes("/admin/auth/login") ||
    endpoint.includes("/admin/login")
  );
}

function getApiErrorCode(data: any) {
  return data?.data?.code || data?.code || data?.response?.code || "";
}

function getApiErrorMessage(data: any) {
  return data?.message || data?.error || "";
}

function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_user");

  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("fl_permissions_loaded_")) {
      sessionStorage.removeItem(key);
    }
  });
}

let isRedirectingToLogin = false;

function redirectToLoginOn401(msg: string) {
  if (isRedirectingToLogin) return;

  isRedirectingToLogin = true;

  const firstPath = getTenantSlugFromUrl();

  clearAuthStorage();

  sessionStorage.setItem("auth_flash_error", msg);

  const loginUrl =
    firstPath === "admin"
      ? "/admin/login"
      : firstPath
        ? `/${firstPath}/login`
        : "/login";

  window.location.replace(loginUrl);
}

async function request(
  method: string,
  endpoint: string,
  body?: any,
  config: RequestConfig = {},
) {
  const baseUrl = config.baseUrl || BASE_URL;

  if (!baseUrl) {
    throw new Error("BASE_URL missing");
  }

  const token = localStorage.getItem("token");

  const pathname = window.location.pathname;
  const slug = pathname.split("/")[1] || "";
  const tenantId = localStorage.getItem("tenantId");

  const headers: Record<string, string> = {
    ...(config.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (slug && slug !== "admin") {
    headers["x-tenant-slug"] = slug;
  }

  if (tenantId) {
    headers["x-tenant-id"] = tenantId;
  }

  if (!config.isFormData) {
    headers["Content-Type"] = "application/json";
  }

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

  if (res.status === 401 && !isLoginRequest(endpoint)) {
    const apiCode = getApiErrorCode(data);

    const msg = token
      ? "Token expired. Login again."
      : "Please login to continue.";

    console.error("401 API =>", url, data);

    redirectToLoginOn401(msg);

    const err: any = new Error(msg);
    err.status = 401;
    err.data = data;
    err.code = apiCode || (token ? "TOKEN_EXPIRED" : "AUTH_REQUIRED");

    throw err;
  }

  if (res.status === 403) {
    const msg = getApiErrorMessage(data) || "Forbidden";

    showErr(msg, config.shouldHideError);

    const err: any = new Error(msg);
    err.status = 403;
    err.data = data;

    throw err;
  }

  if (!res.ok) {
    const msg = getApiErrorMessage(data) || res.statusText || "Request failed";

    const err: any = new Error(msg);
    err.status = res.status;
    err.data = data;

    showErr(msg, config.shouldHideError);

    throw err;
  }

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
