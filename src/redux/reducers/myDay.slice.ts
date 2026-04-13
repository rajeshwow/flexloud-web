import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type WorkQueueItemType =
  | "task"
  | "lead_followup"
  | "quote_expiry"
  | "visit"
  | "stale_lead";

export type WorkQueuePriority = "low" | "medium" | "high" | "urgent";

export type WorkQueueSectionStatus =
  | "today"
  | "overdue"
  | "upcoming"
  | "needs_attention";

export type WorkQueueItem = {
  id: string;
  type: WorkQueueItemType;
  entity_id: string;
  entity_number?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  due_at?: string | null;
  priority: WorkQueuePriority;
  section: WorkQueueSectionStatus;
  assigned_to_user_id?: string | null;
  assigned_to_name?: string | null;
  related_to_type?: string | null;
  related_to_id?: string | null;
  related_to_label?: string | null;
  route: string;
  action_label?: string | null;
  meta?: Record<string, any>;
};

export type MyDayResponse = {
  summary: {
    total_today: number;
    total_overdue: number;
    total_upcoming: number;
    total_needs_attention: number;
  };
  sections: {
    overdue: WorkQueueItem[];
    today: WorkQueueItem[];
    upcoming: WorkQueueItem[];
    needs_attention: WorkQueueItem[];
  };
};

export type MyDayCounts = {
  total: number;
  overdue: number;
  today: number;
  upcoming: number;
  needs_attention: number;
};

type FetchMyDayParams = {
  view?: "today" | "overdue" | "upcoming" | "all";
  assigned?: "me" | "all";
};

type MyDayState = {
  data: MyDayResponse | null;
  counts: MyDayCounts;
  loading: boolean;
  countsLoading: boolean;
  error: string | null;
  notificationDrawerOpen: boolean;
};

const initialState: MyDayState = {
  data: null,
  counts: {
    total: 0,
    overdue: 0,
    today: 0,
    upcoming: 0,
    needs_attention: 0,
  },
  loading: false,
  countsLoading: false,
  error: null,
  notificationDrawerOpen: false,
};

export const fetchMyDay = createAsyncThunk(
  "myDay/fetchMyDay",
  async (params: FetchMyDayParams | undefined, thunkAPI) => {
    try {
      const resp = await Client.get(withTenant("/my-day"), {
        params: {
          view: params?.view || "all",
          assigned: params?.assigned || "me",
        },
      });

      return resp?.data?.data as MyDayResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch My Day",
      );
    }
  },
);

export const fetchMyDayCounts = createAsyncThunk(
  "myDay/fetchMyDayCounts",
  async (params: FetchMyDayParams | undefined, thunkAPI) => {
    try {
      const resp = await Client.get(withTenant("/my-day/counts"), {
        params: {
          view: params?.view || "all",
          assigned: params?.assigned || "me",
        },
      });

      return resp?.data?.data as MyDayCounts;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch My Day counts",
      );
    }
  },
);

const myDaySlice = createSlice({
  name: "myDay",
  initialState,
  reducers: {
    setNotificationDrawerOpen(state, action) {
      state.notificationDrawerOpen = action.payload;
    },
    resetMyDayState(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyDay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyDay.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMyDay.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch My Day";
      })

      .addCase(fetchMyDayCounts.pending, (state) => {
        state.countsLoading = true;
      })
      .addCase(fetchMyDayCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.counts = action.payload;
      })
      .addCase(fetchMyDayCounts.rejected, (state) => {
        state.countsLoading = false;
      });
  },
});

export const { setNotificationDrawerOpen, resetMyDayState } =
  myDaySlice.actions;
export default myDaySlice.reducer;
