import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type LeaveItem = {
  id: string;
  leave_type: "casual" | "sick" | "paid" | "unpaid" | "optional";
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  rejection_reason?: string | null;
  approved_by_name?: string | null;
  applied_to_name?: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplyLeavePayload = {
  leave_type: "casual" | "sick" | "paid" | "unpaid" | "optional";
  start_date: string;
  end_date: string;
  reason?: string;
  applied_to_user_id?: string | null;
};

export type GetLeavesParams = {
  page?: number;
  limit?: number;
  status?: string;
  leave_type?: string;
  search?: string;
};

type LeavesState = {
  loading: boolean;
  listLoading: boolean;
  items: LeaveItem[];
  total: number;
  page: number;
  limit: number;
  error: string | null;
};

const initialState: LeavesState = {
  loading: false,
  listLoading: false,
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  error: null,
};

export const applyLeave = createAsyncThunk(
  "leaves/applyLeave",
  async (payload: ApplyLeavePayload, { rejectWithValue }) => {
    try {
      const res = await Client.post(withTenant("/leaves/me/apply"), payload);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to apply leave",
      );
    }
  },
);

export const getMyLeaves = createAsyncThunk(
  "leaves/getMyLeaves",
  async (params: GetLeavesParams = {}, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/leaves/me"), { params });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch leaves",
      );
    }
  },
);

export const cancelLeave = createAsyncThunk(
  "leaves/cancelLeave",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await Client.patch(withTenant(`/leaves/me/${id}/cancel`));
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to cancel leave",
      );
    }
  },
);

const leavesSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    resetLeavesState: () => initialState,
    resetLeavesListState: (state) => {
      state.items = [];
      state.total = 0;
      state.page = 1;
      state.limit = 10;
      state.listLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getMyLeaves.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(getMyLeaves.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload?.data || [];
        state.total = action.payload?.pagination?.total || 0;
        state.page = action.payload?.pagination?.page || 1;
        state.limit = action.payload?.pagination?.limit || 10;
      })
      .addCase(getMyLeaves.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload as string;
      })

      .addCase(cancelLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelLeave.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetLeavesState, resetLeavesListState } = leavesSlice.actions;
export default leavesSlice.reducer;
