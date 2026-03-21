import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type VisitItem = {
  id: string;
  name: string;
  status?: string | null;
  regarding?: string | null;
  ticket_status?: string | null;

  start_date?: string | null;
  end_date?: string | null;
  next_followup_date?: string | null;

  duration?: string | null;
  duration_in_minutes?: number | null;
  remarks?: string | null;

  assigned_to_user_id?: string | null;
  assigned_to_name?: string | null;

  organization_id?: string | null;
  contact_id?: string | null;
  lead_id?: string | null;
  case_id?: string | null;

  checkin_address?: string | null;
  checkout_address?: string | null;
  checkin_latitude?: number | null;
  checkin_longitude?: number | null;
  checkout_latitude?: number | null;
  checkout_longitude?: number | null;

  spare_cost?: number | null;
  employee_cost?: number | null;
  travelling_cost?: number | null;
  other_cost?: number | null;
  total_cost?: number | null;

  created_at?: string | null;
  updated_at?: string | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;
};

export type GetVisitsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  regarding?: string;
  assigned_to_user_id?: string;
};

export type CreateVisitPayload = {
  name: string;
  status?: string;
  regarding?: string;
  ticket_status?: string;

  start_date?: string;
  end_date?: string;
  next_followup_date?: string;

  remarks?: string;

  assigned_to_user_id?: string;
  organization_id?: string;
  contact_id?: string;
  lead_id?: string;
  case_id?: string;

  checkin_address?: string;
  checkout_address?: string;
  checkin_latitude?: number;
  checkin_longitude?: number;
  checkout_latitude?: number;
  checkout_longitude?: number;

  spare_cost?: number;
  employee_cost?: number;
  travelling_cost?: number;
  other_cost?: number;
};

type VisitsState = {
  list: VisitItem[];
  listLoading: boolean;
  listPagination: {
    total: number;
    page: number;
    limit: number;
  };
  selectedVisit: VisitItem | null;
  detailsLoading: boolean;
  actionLoading: boolean;
};

const initialState: VisitsState = {
  list: [],
  listLoading: false,
  listPagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
  selectedVisit: null,
  detailsLoading: false,
  actionLoading: false,
};

export const getVisits = createAsyncThunk(
  "visits/getVisits",
  async (params: GetVisitsParams = {}, thunkAPI) => {
    try {
      const response = await Client.get(withTenant("/visits"), { params });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  },
);

export const getVisitById = createAsyncThunk(
  "visits/getVisitById",
  async (id: string, thunkAPI) => {
    try {
      const response = await Client.get(withTenant(`/visits/${id}`));
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  },
);

export const createVisit = createAsyncThunk(
  "visits/createVisit",
  async (payload: CreateVisitPayload, thunkAPI) => {
    try {
      const response = await Client.post(withTenant("/visits"), payload);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  },
);

export const updateVisit = createAsyncThunk(
  "visits/updateVisit",
  async (
    payload: { id: string; data: Partial<CreateVisitPayload> },
    thunkAPI,
  ) => {
    try {
      const response = await Client.patch(
        withTenant(`/visits/${payload.id}`),
        payload.data,
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  },
);

const visitsSlice = createSlice({
  name: "visits",
  initialState,
  reducers: {
    resetVisitsState: () => initialState,
    resetVisitDetailsState: (state) => {
      state.selectedVisit = null;
      state.detailsLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getVisits.pending, (state) => {
        state.listLoading = true;
      })
      .addCase(getVisits.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload?.data?.items || [];
        state.listPagination = {
          total: action.payload?.data?.total || 0,
          page: action.payload?.data?.page || 1,
          limit: action.payload?.data?.limit || 10,
        };
      })
      .addCase(getVisits.rejected, (state) => {
        state.listLoading = false;
      })

      .addCase(getVisitById.pending, (state) => {
        state.detailsLoading = true;
      })
      .addCase(getVisitById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedVisit = action.payload?.data || null;
      })
      .addCase(getVisitById.rejected, (state) => {
        state.detailsLoading = false;
      })

      .addCase(createVisit.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createVisit.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createVisit.rejected, (state) => {
        state.actionLoading = false;
      })

      .addCase(updateVisit.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateVisit.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(updateVisit.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { resetVisitsState, resetVisitDetailsState } = visitsSlice.actions;
export default visitsSlice.reducer;
