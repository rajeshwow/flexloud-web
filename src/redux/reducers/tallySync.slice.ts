import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export interface TallySyncState {
  loading: boolean;
  checking: boolean;
  running: boolean;
  status: any | null;
  connectionCheck: any | null;
  error: string | null;
}

const initialState: TallySyncState = {
  loading: false,
  checking: false,
  running: false,
  status: null,
  connectionCheck: null,
  error: null,
};

export const fetchTallySyncStatus = createAsyncThunk(
  "tallySync/fetchTallySyncStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/tally/sync/status"));
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch Tally sync status",
      );
    }
  },
);

export const checkTallyConnection = createAsyncThunk(
  "tallySync/checkTallyConnection",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Client.get(
        withTenant("/tally/sync/check-connection"),
      );
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to check Tally connection",
      );
    }
  },
);

export const runTallyManualSync = createAsyncThunk(
  "tallySync/runTallyManualSync",
  async (_, { rejectWithValue }) => {
    try {
      const response = await Client.post(withTenant("/tally/sync/run"), {});
      return response.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to start Tally sync",
      );
    }
  },
);

const tallySyncSlice = createSlice({
  name: "tallySync",
  initialState,
  reducers: {
    resetTallySyncState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTallySyncStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTallySyncStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(fetchTallySyncStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(checkTallyConnection.pending, (state) => {
        state.checking = true;
        state.error = null;
      })
      .addCase(checkTallyConnection.fulfilled, (state, action) => {
        state.checking = false;
        state.connectionCheck = action.payload;
      })
      .addCase(checkTallyConnection.rejected, (state, action) => {
        state.checking = false;
        state.error = action.payload as string;
      })

      .addCase(runTallyManualSync.pending, (state) => {
        state.running = true;
        state.error = null;
      })
      .addCase(runTallyManualSync.fulfilled, (state) => {
        state.running = false;
      })
      .addCase(runTallyManualSync.rejected, (state, action) => {
        state.running = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTallySyncState } = tallySyncSlice.actions;
export default tallySyncSlice.reducer;
