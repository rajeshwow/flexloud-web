import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type DashboardPeriod = "today" | "week" | "month" | "all";

export type DashboardChartRow = {
  name: string;
  value: number;
};

export type DashboardModuleUsageStatus =
  | "Active"
  | "Growing"
  | "Needs Attention";

export type DashboardModuleUsageRow = {
  key: string;
  module: string;
  total: number;
  trend: string;
  status: DashboardModuleUsageStatus;
};

export type DashboardActivityRow = {
  id: string;
  title: string;
  description: string;
  time: string;
};

export type DashboardMetrics = {
  totalLeads: number;
  totalContacts: number;
  totalOrganizations: number;
  openTasks: number;
  overdueTasks: number;
  totalQuotes: number;
  visitsThisWeek: number;
  interactionsThisWeek: number;
  attendanceToday: number;
  activeUsers: number;
};

export type DashboardSummary = {
  metrics: DashboardMetrics;
  leadStatusStats: DashboardChartRow[];
  taskPriorityStats: DashboardChartRow[];
  moduleUsage: DashboardModuleUsageRow[];
  recentActivities: DashboardActivityRow[];
  filters: {
    period: DashboardPeriod;
  };
};

export type GetDashboardSummaryParams = {
  period?: DashboardPeriod;
};

type DashboardState = {
  summary: DashboardSummary | null;
  summaryLoading: boolean;
  summaryError: string | null;
};

const initialState: DashboardState = {
  summary: null,
  summaryLoading: false,
  summaryError: null,
};

export const fetchDashboardSummary = createAsyncThunk<
  DashboardSummary,
  GetDashboardSummaryParams | undefined,
  { rejectValue: string }
>("dashboard/fetchDashboardSummary", async (params, { rejectWithValue }) => {
  try {
    const response = await Client.get(withTenant("/dashboard/summary"), {
      params: {
        period: params?.period || "month",
      },
    });

    return response.data.data as DashboardSummary;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch dashboard summary",
    );
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboardState: (state) => {
      state.summaryLoading = false;
      state.summaryError = null;
    },
    resetDashboardSummary: (state) => {
      state.summary = null;
      state.summaryLoading = false;
      state.summaryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
        state.summaryError = null;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError =
          action.payload || "Failed to fetch dashboard summary";
      });
  },
});

export const { resetDashboardState, resetDashboardSummary } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
