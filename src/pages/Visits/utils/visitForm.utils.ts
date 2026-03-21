import dayjs, { Dayjs } from "dayjs";

export const VISIT_STATUS_OPTIONS = [
  { label: "Planned", value: "planned" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const VISIT_REGARDING_OPTIONS = [
  { label: "Organization", value: "organization" },
  { label: "Contact", value: "contact" },
  { label: "Lead", value: "lead" },
  { label: "Case", value: "case" },
  { label: "Other", value: "other" },
];

export const VISIT_TICKET_STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

export function toDayjs(value?: string | null): Dayjs | null {
  return value ? dayjs(value) : null;
}

export function toIsoString(value?: Dayjs | null) {
  return value ? value.toISOString() : undefined;
}

export function calculateDurationInMinutes(
  start?: Dayjs | null,
  end?: Dayjs | null,
) {
  if (!start || !end) return 0;
  const diff = end.diff(start, "minute");
  return diff > 0 ? diff : 0;
}

export function formatDuration(minutes?: number) {
  if (!minutes) return "0m";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs && mins) return `${hrs}h ${mins}m`;
  if (hrs) return `${hrs}h`;
  return `${mins}m`;
}

export function getTotalCost(values: {
  spare_cost?: number;
  employee_cost?: number;
  travelling_cost?: number;
  other_cost?: number;
}) {
  return (
    Number(values.spare_cost || 0) +
    Number(values.employee_cost || 0) +
    Number(values.travelling_cost || 0) +
    Number(values.other_cost || 0)
  );
}
