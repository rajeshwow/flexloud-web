import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type ReminderItem = {
  id?: string;
  minutes_before: number;
};

export type InviteeItem = {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  linked_contact_id?: string;
  linked_lead_id?: string;
};

export type InteractionItem = {
  id: string;
  interaction_number: string;
  type: "meeting" | "call";
  subject: string;
  status: "planned" | "held" | "not_held" | "completed" | "cancelled";
  related_to_type?: "lead" | "contact" | "organization" | "opportunity" | null;
  related_to_id?: string | null;
  start_at: string;
  end_at: string;
  duration_minutes?: number;
  location?: string | null;
  description?: string | null;
  assigned_to?: string | null;
  call_purpose?: string | null;
  call_outcome?: string | null;
  reminders?: ReminderItem[];
  invitees?: InviteeItem[];
  created_at?: string;
  updated_at?: string;
};

export type GetInteractionsParams = {
  search?: string;
  page?: number;
  limit?: number;
  type?: "meeting" | "call";
  status?: "planned" | "held" | "not_held" | "completed" | "cancelled";
};

type InteractionsState = {
  list: InteractionItem[];
  total: number;
  details: InteractionItem | null;
  listLoading: boolean;
  detailsLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  error: string | null;
};

const initialState: InteractionsState = {
  list: [],
  total: 0,
  details: null,
  listLoading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,
  error: null,
};

export const fetchInteractions = createAsyncThunk(
  "interactions/fetchInteractions",
  async (params: GetInteractionsParams | undefined, thunkAPI) => {
    try {
      const response = await Client.get(withTenant("/interactions"), {
        params,
      });
      return response?.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch interactions",
      );
    }
  },
);

export const fetchInteractionDetails = createAsyncThunk(
  "interactions/fetchInteractionDetails",
  async (id: string, thunkAPI) => {
    try {
      const response = await Client.get(withTenant(`/interactions/${id}`));
      return response?.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch interaction details",
      );
    }
  },
);

export const createInteraction = createAsyncThunk(
  "interactions/createInteraction",
  async (payload: Partial<InteractionItem>, thunkAPI) => {
    try {
      const response = await Client.post(withTenant("/interactions"), payload);
      return response?.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to create Event",
      );
    }
  },
);

export const updateInteraction = createAsyncThunk(
  "interactions/updateInteraction",
  async (
    { id, payload }: { id: string; payload: Partial<InteractionItem> },
    thunkAPI,
  ) => {
    try {
      const response = await Client.patch(
        withTenant(`/interactions/${id}`),
        payload,
      );
      return response?.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to update Event",
      );
    }
  },
);

const interactionsSlice = createSlice({
  name: "interactions",
  initialState,
  reducers: {
    clearInteractionDetails: (state) => {
      state.details = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload?.data || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchInteractionDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchInteractionDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.details = action.payload;
      })
      .addCase(fetchInteractionDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createInteraction.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createInteraction.fulfilled, (state) => {
        state.createLoading = false;
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateInteraction.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateInteraction.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updateInteraction.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearInteractionDetails } = interactionsSlice.actions;
export default interactionsSlice.reducer;
