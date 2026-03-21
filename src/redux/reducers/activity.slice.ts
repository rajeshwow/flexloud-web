import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type ActivityItem = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  description?: string;
  created_at: string;
  created_by_id: string;
  user_name?: string;
};

type ActivityState = {
  timeline: ActivityItem[];
  loading: boolean;
  error: string | null;
};

const initialState: ActivityState = {
  timeline: [],
  loading: false,
  error: null,
};

export const fetchActivityTimeline = createAsyncThunk<
  ActivityItem[],
  { entityType: string; entityId: string }
>(
  "activity/fetchTimeline",
  async ({ entityType, entityId }, { rejectWithValue }) => {
    try {
      const res = await Client.get(
        withTenant(`/activity/${entityType}/${entityId}`),
      );

      return res.data.data || [];
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch activity",
      );
    }
  },
);

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    resetActivityState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline = action.payload;
      })
      .addCase(fetchActivityTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetActivityState } = activitySlice.actions;

export default activitySlice.reducer;
