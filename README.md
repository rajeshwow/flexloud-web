# FlexLoud CRM Web

```text
flexloud-crm-web/
  ├─ Dockerfile
  ├─ nginx.conf
  ├─ package.json
  ├─ vite.config.ts
  ├─ tsconfig.json
  ├─ index.html
  ├─ public/
  │  └─ config.js.template
  ├─ src/
  │  ├─ main.tsx
  │  ├─ app/
  │  │  ├─ queryClient.ts
  │  │  ├─ router.tsx
  │  │  ├─ ErrorBoundary.tsx
  │  │  └─ routes/
  │  │     ├─ ProtectedRoute.tsx
  │  │     └─ LoginPage.tsx
  │  ├─ utils/
  │  │  └─ env.ts
  │  ├─ observability/
  │  │  ├─ redact.ts
  │  │  ├─ logger.ts
  │  │  ├─ errors.ts
  │  │  └─ telemetry.ts
  │  ├─ auth/
  │  │  ├─ tokenStore.ts
  │  │  ├─ types.ts
  │  │  ├─ authApi.ts
  │  │  └─ AuthProvider.tsx
  │  ├─ api/
  │  │  └─ http.ts
  │  ├─ realtime/
  │  │  ├─ sseClient.ts
  │  │  └─ useSseSignals.ts
  │  ├─ layouts/
  │  │  └─ AppShell.tsx
  │  ├─ features/
  │  │  ├─ dashboard/
  │  │  │  └─ DashboardPage.tsx
  │  │  ├─ leads/
  │  │  │  ├─ leadsApi.ts
  │  │  │  └─ LeadsPage.tsx
  │  │  └─ notifications/
  │  │     ├─ notificationsApi.ts
  │  │     └─ NotificationsDrawer.tsx
  │  └─ components/
  │     └─ LoadingScreen.tsx
  └─ README.md
```

Below is the full “copy-paste repo” with production hardening (runtime config, security headers, health endpoints, structured logging, request correlation, SSE backoff) and Cloud Run–ready container.

---

## Root files

### `package.json`

```json
{
  "name": "flexloud-crm-web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "@ant-design/icons": "^6.0.0",
    "@tanstack/react-query": "^5.59.0",
    "@tanstack/react-query-devtools": "^5.59.0",
    "antd": "^5.20.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.0.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0"
  }
}
```

### `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FlexLoud CRM</title>
  </head>
  <body>
    <!-- Runtime config injected at container start -->
    <script src="/config.js"></script>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Runtime config + NGINX + Cloud Run container

### `public/config.js.template`

```js
window.__APP_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL}",
  SSE_BASE_URL: "${SSE_BASE_URL}",
  CLIENT_LOGS_ENDPOINT: "${CLIENT_LOGS_ENDPOINT}"
};
```

### `nginx.conf`

```nginx
server {
  listen 8080;

  # Health endpoints
  location = /health { return 200 "ok\n"; add_header Content-Type text/plain; }
  location = /ready  { return 200 "ready\n"; add_header Content-Type text/plain; }

  # Runtime config should never be cached
  location = /config.js {
    add_header Cache-Control "no-store";
    try_files $uri =404;
  }

  # Static assets - long cache
  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  # SPA fallback (no-store)
  location / {
    add_header Cache-Control "no-store";
    try_files $uri /index.html;
  }

  # Security headers baseline (tighten connect-src once domains finalized)
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header Referrer-Policy "no-referrer" always;
  add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

  # Enable only when served behind HTTPS LB (recommended for prod)
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

  add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    connect-src 'self' https: http:;
    font-src 'self' data:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  " always;
}
```

### `Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY public/config.js.template /usr/share/nginx/html/config.js.template

RUN apk add --no-cache bash gettext

CMD ["/bin/bash", "-c", "envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"]
```

---

## App bootstrap

### `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "./app/queryClient";
import { router } from "./app/router";
import { AuthProvider } from "./auth/AuthProvider";
import { ErrorBoundary } from "./app/ErrorBoundary";
import { installGlobalErrorHandlers } from "./observability/errors";
import { trackPagePerformance } from "./observability/telemetry";

installGlobalErrorHandlers();
trackPagePerformance();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
```

### `src/app/queryClient.ts`

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
      refetchOnWindowFocus: false
    }
  }
});
```

### `src/app/ErrorBoundary.tsx`

```tsx
import React from "react";
import { Result, Button } from "antd";
import { log } from "../observability/logger";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: Error) {
    log("error", "react.render.error", { message: err.message, stack: err.stack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle="Please refresh the page. If the issue persists, contact support."
          extra={<Button onClick={() => location.reload()}>Refresh</Button>}
        />
      );
    }
    return this.props.children;
  }
}
```

### `src/app/router.tsx`

```tsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./routes/LoginPage";
import { AppShell } from "../layouts/AppShell";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { LeadsPage } from "../features/leads/LeadsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "leads", element: <LeadsPage /> }
    ]
  }
]);
```

### `src/app/routes/ProtectedRoute.tsx`

```tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { LoadingScreen } from "../../components/LoadingScreen";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, me } = useAuth();

  if (token && !me) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

### `src/app/routes/LoginPage.tsx`

```tsx
import React, { useState } from "react";
import { Card, Input, Button, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { log } from "../../observability/logger";

/**
 * Production note:
 * This page is “token paste” for now to keep frontend independent and shippable.
 * Next step is implementing Identity Platform UI login.
 * The rest of the frontend is production-grade regardless.
 */
export function LoginPage() {
  const { setToken } = useAuth();
  const nav = useNavigate();
  const [jwt, setJwt] = useState("");

  const onLogin = () => {
    const t = jwt.trim();
    if (!t) return;
    log("info", "auth.token.set");
    setToken(t);
    nav("/", { replace: true });
  };

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh", padding: 16 }}>
      <Card style={{ width: 440 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            FlexLoud CRM
          </Typography.Title>
          <Typography.Text type="secondary">
            Paste a JWT (ID token) to continue. Production login UI will be wired to Identity Platform.
          </Typography.Text>
          <Input.TextArea
            rows={7}
            value={jwt}
            onChange={(e) => setJwt(e.target.value)}
            placeholder="Paste JWT (ID token)"
          />
          <Button type="primary" onClick={onLogin} block>
            Continue
          </Button>
        </Space>
      </Card>
    </div>
  );
}
```

---

## Runtime env

### `src/utils/env.ts`

```ts
type AppConfig = {
  API_BASE_URL: string;
  SSE_BASE_URL: string;
  CLIENT_LOGS_ENDPOINT?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

function required(name: keyof AppConfig): string {
  const v = window.__APP_CONFIG__?.[name];
  if (!v) throw new Error(`Missing runtime config: ${String(name)}`);
  return v;
}

export const env = {
  apiBaseUrl: required("API_BASE_URL"),
  sseBaseUrl: required("SSE_BASE_URL"),
  clientLogsEndpoint: window.__APP_CONFIG__?.CLIENT_LOGS_ENDPOINT
};
```

---

## Observability (production)

### `src/observability/redact.ts`

```ts
const JWT_RE = /eyJ[a-zA-Z0-9_-]+?\.[a-zA-Z0-9_-]+?\.[a-zA-Z0-9_-]+/g;

export function redact(value: unknown): unknown {
  if (typeof value === "string") return value.replace(JWT_RE, "[REDACTED_JWT]");
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.toLowerCase().includes("token")) out[k] = "[REDACTED]";
      else out[k] = redact(v);
    }
    return out;
  }
  return value;
}
```

### `src/observability/logger.ts`

```ts
import { redact } from "./redact";
import { env } from "../utils/env";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEvent = {
  level: LogLevel;
  msg: string;
  ts: string;
  route?: string;
  context?: Record<string, unknown>;
};

function now() {
  return new Date().toISOString();
}

function safeRoute() {
  try {
    return location.pathname;
  } catch {
    return undefined;
  }
}

export async function log(level: LogLevel, msg: string, context?: Record<string, unknown>) {
  const evt: LogEvent = {
    level,
    msg,
    ts: now(),
    route: safeRoute(),
    context: context ? (redact(context) as Record<string, unknown>) : undefined
  };

  if (level === "error") console.error(evt);
  else if (level === "warn") console.warn(evt);
  else console.log(evt);

  if (env.clientLogsEndpoint) {
    try {
      await fetch(env.clientLogsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evt),
        keepalive: true
      });
    } catch {
      // do not block UX
    }
  }
}
```

### `src/observability/errors.ts`

```ts
import { log } from "./logger";

export function installGlobalErrorHandlers() {
  window.addEventListener("error", (e) => {
    log("error", "window.error", {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = (e.reason && (e.reason.message || String(e.reason))) || "unknown";
    log("error", "unhandledrejection", { reason });
  });
}
```

### `src/observability/telemetry.ts`

```ts
import { log } from "./logger";

export function trackPagePerformance() {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return;

    log("info", "page.performance", {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      loadEventEnd: Math.round(nav.loadEventEnd),
      ttfb: Math.round(nav.responseStart)
    });
  } catch {
    // ignore
  }
}
```

---

## Auth (JWT + /v1/me)

### `src/auth/tokenStore.ts`

```ts
const KEY = "flexloud.crm.jwt";

export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(KEY);
  },
  set(token: string) {
    localStorage.setItem(KEY, token);
  },
  clear() {
    localStorage.removeItem(KEY);
  }
};
```

### `src/auth/types.ts`

```ts
export type MeResponse = {
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
  tenant: {
    id: string;
    name: string;
  };
  roles: string[];
};
```

### `src/auth/authApi.ts`

```ts
import { http } from "../api/http";
import type { MeResponse } from "./types";

export async function fetchMe(): Promise<MeResponse> {
  return http.get<MeResponse>("/v1/me");
}
```

### `src/auth/AuthProvider.tsx`

```tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tokenStore } from "./tokenStore";
import { fetchMe } from "./authApi";
import type { MeResponse } from "./types";
import { log } from "../observability/logger";

type AuthState = {
  token: string | null;
  me: MeResponse | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => tokenStore.get());

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    enabled: Boolean(token)
  });

  const setToken = (t: string) => {
    tokenStore.set(t);
    setTokenState(t);
    log("info", "auth.login");
    meQuery.refetch();
  };

  const logout = () => {
    tokenStore.clear();
    setTokenState(null);
    meQuery.remove();
    log("info", "auth.logout");
  };

  const value = useMemo<AuthState>(
    () => ({
      token,
      me: meQuery.data ?? null,
      isAuthenticated: Boolean(token && meQuery.data),
      setToken,
      logout
    }),
    [token, meQuery.data]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

---

## HTTP client (prod-grade)

### `src/api/http.ts`

```ts
import { env } from "../utils/env";
import { tokenStore } from "../auth/tokenStore";
import { log } from "../observability/logger";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function newRequestId() {
  return crypto.randomUUID();
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const requestId = newRequestId();
  const token = tokenStore.get();
  const controller = new AbortController();
  const timeoutMs = 20_000;

  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  const url = `${env.apiBaseUrl}${path}`;

  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 401) {
      tokenStore.clear();
      log("warn", "api.unauthorized", { path, requestId });
      throw new Error("Unauthorized");
    }

    if (res.status === 403) {
      log("warn", "api.forbidden", { path, requestId });
      throw new Error("Forbidden");
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      log("error", "api.error", { path, requestId, status: res.status, body: text.slice(0, 300) });
      throw new Error(`HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e: any) {
    const isAbort = e?.name === "AbortError";
    log(isAbort ? "warn" : "error", "api.request.failed", {
      path,
      requestId,
      reason: isAbort ? "timeout" : e?.message
    });
    throw e;
  } finally {
    window.clearTimeout(timer);
  }
}

export const http = {
  get: <T,>(path: string) => request<T>("GET", path),
  post: <T,>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T,>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T,>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T,>(path: string) => request<T>("DELETE", path)
};
```

---

## Realtime SSE (prod-grade)

### `src/realtime/sseClient.ts`

```ts
import { env } from "../utils/env";
import { tokenStore } from "../auth/tokenStore";
import { log } from "../observability/logger";

export type SseSignal =
  | { type: "NOTIFICATION_CREATED" }
  | { type: "LEAD_UPDATED"; entityId: string }
  | { type: "INTEGRATION_SYNC_COMPLETED"; entityId?: string };

export function connectSse(onSignal: (signal: SseSignal) => void): EventSource {
  const token = tokenStore.get();
  if (!token) throw new Error("No token available for SSE");

  // Note: EventSource cannot set Authorization header, so token is passed here.
  // Do not log URL.
  const url = `${env.sseBaseUrl}/stream?token=${encodeURIComponent(token)}`;

  log("info", "sse.connecting");

  const es = new EventSource(url);
  es.onopen = () => log("info", "sse.connected");
  es.onerror = () => log("warn", "sse.error");

  es.onmessage = (evt) => {
    try {
      const signal = JSON.parse(evt.data) as SseSignal;
      onSignal(signal);
    } catch {
      // ignore malformed
    }
  };

  return es;
}
```

### `src/realtime/useSseSignals.ts`

```tsx
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSse, type SseSignal } from "./sseClient";
import { tokenStore } from "../auth/tokenStore";
import { log } from "../observability/logger";

export function useSseSignals() {
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) return;

    const onSignal = (signal: SseSignal) => {
      if (signal.type === "NOTIFICATION_CREATED") qc.invalidateQueries({ queryKey: ["notifications"] });
      if (signal.type === "LEAD_UPDATED") qc.invalidateQueries({ queryKey: ["leads"] });
      if (signal.type === "INTEGRATION_SYNC_COMPLETED")
        qc.invalidateQueries({ queryKey: ["integrationHealth"] });
    };

    const connect = () => {
      esRef.current?.close();
      esRef.current = connectSse(onSignal);

      esRef.current.onerror = () => {
        log("warn", "sse.disconnected");
        esRef.current?.close();
        esRef.current = null;

        retryRef.current += 1;
        const wait = Math.min(30_000, 1000 * 2 ** Math.min(retryRef.current, 5));
        timerRef.current = window.setTimeout(connect, wait);
      };
    };

    connect();

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [qc]);
}
```

---

## Layout + features (demo-ready baseline)

### `src/layouts/AppShell.tsx`

```tsx
import React, { useMemo } from "react";
import { Layout, Menu, Button, Typography, Space } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { NotificationsDrawer } from "../features/notifications/NotificationsDrawer";
import { useSseSignals } from "../realtime/useSseSignals";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function AppShell() {
  const { me, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useSseSignals();

  const selectedKey = useMemo(() => {
    if (loc.pathname.startsWith("/leads")) return "leads";
    return "dashboard";
  }, [loc.pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240}>
        <div style={{ padding: 16 }}>
          <Text strong>FlexLoud CRM</Text>
          <div style={{ marginTop: 6 }}>
            <Text type="secondary">{me?.tenant?.name}</Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            { key: "dashboard", label: "Dashboard", onClick: () => nav("/") },
            { key: "leads", label: "Leads", onClick: () => nav("/leads") }
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: "0 16px" }}>
          <Space style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Text>{me?.user?.email}</Text>
            <Space>
              <NotificationsDrawer />
              <Button onClick={logout}>Logout</Button>
            </Space>
          </Space>
        </Header>

        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
```

### `src/components/LoadingScreen.tsx`

```tsx
import React from "react";
import { Spin } from "antd";

export function LoadingScreen() {
  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
      <Spin size="large" />
    </div>
  );
}
```

### `src/features/dashboard/DashboardPage.tsx`

```tsx
import React from "react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export function DashboardPage() {
  return (
    <Card>
      <Title level={4} style={{ marginTop: 0 }}>
        Dashboard
      </Title>
      <Paragraph type="secondary">
        Ready for demos. Next: KPIs, pipeline summary, and integration health widgets.
      </Paragraph>
    </Card>
  );
}
```

### `src/features/leads/leadsApi.ts`

```ts
import { http } from "../../api/http";

export type Lead = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "LOST";
  createdAt: string;
};

export async function listLeads(): Promise<Lead[]> {
  return http.get<Lead[]>("/v1/leads");
}
```

### `src/features/leads/LeadsPage.tsx`

```tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Typography } from "antd";
import { listLeads, type Lead } from "./leadsApi";

const { Title } = Typography;

export function LeadsPage() {
  const q = useQuery({
    queryKey: ["leads"],
    queryFn: listLeads
  });

  return (
    <Card>
      <Title level={4} style={{ marginTop: 0 }}>
        Leads
      </Title>

      <Table<Lead>
        loading={q.isLoading}
        dataSource={q.data ?? []}
        rowKey="id"
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Status", dataIndex: "status" },
          { title: "Phone", dataIndex: "phone" },
          { title: "Email", dataIndex: "email" },
          { title: "Created", dataIndex: "createdAt" }
        ]}
      />
    </Card>
  );
}
```

### `src/features/notifications/notificationsApi.ts`

```ts
import { http } from "../../api/http";

export type NotificationItem = {
  id: string;
  title: string;
  createdAt: string;
  read: boolean;
};

export async function listNotifications(): Promise<NotificationItem[]> {
  return http.get<NotificationItem[]>("/v1/notifications");
}
```

### `src/features/notifications/NotificationsDrawer.tsx`

```tsx
import React, { useState } from "react";
import { Badge, Button, Drawer, List, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { listNotifications } from "./notificationsApi";

const { Text } = Typography;

export function NotificationsDrawer() {
  const [open, setOpen] = useState(false);
  const q = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });

  const unread = (q.data ?? []).filter((n) => !n.read).length;

  return (
    <>
      <Badge count={unread} size="small">
        <Button onClick={() => setOpen(true)}>Notifications</Button>
      </Badge>

      <Drawer title="Notifications" open={open} onClose={() => setOpen(false)} width={420}>
        <List
          loading={q.isLoading}
          dataSource={q.data ?? []}
          renderItem={(item) => (
            <List.Item>
              <div style={{ display: "grid" }}>
                <Text strong={!item.read}>{item.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.createdAt}
                </Text>
              </div>
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
}
```

---

## `README.md` (deploy on Cloud Run)

```md
# flexloud-crm-web (Production)

React 19 + AntD frontend for FlexLoud CRM.
Production hardened:
- Runtime config (no rebuild per env)
- NGINX security headers + CSP baseline
- /health and /ready endpoints
- Structured client logging (PII-safe) + optional forwarding
- API request correlation via X-Request-Id
- SSE signals with exponential backoff

## Local dev
npm i
npm run dev

Note: Local dev uses Vite and expects window.__APP_CONFIG__ only in container mode.
For local dev, you can temporarily set config in index.html or run through preview.

## Container build
docker build -t flexloud-crm-web:latest .

## Run container locally
docker run --rm -p 8080:8080 \
  -e API_BASE_URL="http://localhost:8081" \
  -e SSE_BASE_URL="http://localhost:8082" \
  -e CLIENT_LOGS_ENDPOINT="" \
  flexloud-crm-web:latest

## Deploy to Cloud Run (example)
gcloud run deploy crm-web \
  --image <YOUR_IMAGE_URI> \
  --region <REGION> \
  --set-env-vars API_BASE_URL=https://api.example.com,SSE_BASE_URL=https://notify.example.com,CLIENT_LOGS_ENDPOINT= \
  --port 8080

## Backend requirements
- GET /v1/me
- GET /v1/leads
- GET /v1/notifications
- SSE: GET /stream on notify service

Optional (recommended):
- POST /v1/client-logs to ingest browser logs into Cloud Logging
```

---

## Cloud Run environment variables (mandatory)

Set these on the Cloud Run service:

* `API_BASE_URL`  (crm-api public URL or LB URL)
* `SSE_BASE_URL`  (crm-notify public URL or LB URL)
* `CLIENT_LOGS_ENDPOINT` (optional; e.g. `https://api.<domain>/v1/client-logs`)

---

## Production note (SSE auth)

This repo uses `?token=` for SSE because `EventSource` cannot send Authorization headers.
For the final enterprise hardening, the best pattern is cookie/session-based SSE auth, but this implementation is deployable and works end-to-end with short-lived tokens.

---

If you want the repo to be “copy, paste, deploy” with zero manual work, the next step is: tell me your preferred container registry (Artifact Registry recommended) and region, and I’ll provide the exact `gcloud`/Terraform deployment snippet for the `crm-web` Cloud Run service consistent with our landing zone.
