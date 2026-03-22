import dayjs from "dayjs";

export const getTenantSlug = () => {
  const pathSlug = window.location.pathname.split("/")[1];
  return pathSlug || localStorage.getItem("tenantSlug") || "";
};

export const withTenant = (path: string) => `/v1/${getTenantSlug()}${path}`;

export const getTenantId = () => localStorage.getItem("tenantId") || "";

export const withTenantId = (path: string) => `/v1/${getTenantId()}${path}`;

export const withTenantIdAndSlug = (path: string) =>
  `/v1/${getTenantId()}/${getTenantSlug()}${path}`;

export const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD MMM YYYY, hh:mm A") : "-";
};
