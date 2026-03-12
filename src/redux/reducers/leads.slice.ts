import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type LeadStatus =
  | "New"
  | "Converted"
  | "In Process"
  | "Recycled"
  | "Dead"
  | "Assigned"
  | string;

export type LeadItem = {
  id: string;
  lead_number?: string;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  office_phone?: string;
  organization_name?: string;
  status?: string;
  priority?: string;
  lead_source?: string;
  next_followup?: string;
  created_at?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  emails?: {
    email: string;
    primary?: boolean;
    opt_out?: boolean;
    invalid?: boolean;
  }[];
};

export type LeadsInsightItem = {
  key: string;
  label: string;
  percent: number;
  total: number;
};

export type FetchLeadsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assigned_to?: string;
};

export type CreateLeadPayload = {
  lead_number?: string;
  name: string;
  status?: string | null;
  organization_name?: string | null;
  office_phone?: string | null;
  email?: string | null;
  user_id?: string | null;
  next_followup?: string | null;
  mobile?: string | null;
  company?: string | null;
  source?: string | null;
  description?: string | null;
};

export type UpdateLeadPayload = {
  id: string;
  lead_number?: string;
  name?: string;
  status?: string | null;
  organization_name?: string | null;
  office_phone?: string | null;
  email?: string | null;
  user_id?: string | null;
  next_followup?: string | null;
  mobile?: string | null;
  company?: string | null;
  source?: string | null;
  description?: string | null;
};

type FetchLeadsResponse = {
  data: LeadItem[];
  total: number;
  page: number;
  limit: number;
  insights?: {
    status_breakdown: LeadsInsightItem[];
  };
};

type FetchLeadByIdResponse = {
  data: LeadItem;
};

type CreateLeadResponse = {
  message: string;
  data: LeadItem;
};

type UpdateLeadResponse = {
  message: string;
  data: LeadItem;
};

type DeleteLeadResponse = {
  message: string;
  id: string;
};

type LeadsState = {
  leads: LeadItem[];
  leadDetails: LeadItem | null;

  listLoading: boolean;
  listError: string | null;
  total: number;
  page: number;
  limit: number;
  insights?: {
    status_breakdown: LeadsInsightItem[];
  };

  detailsLoading: boolean;
  detailsError: string | null;

  createLoading: boolean;
  createError: string | null;
  createSuccess: boolean;

  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;

  deleteLoading: boolean;
  deleteError: string | null;
  deleteSuccess: boolean;
};

const initialState: LeadsState = {
  leads: [],
  leadDetails: null,

  listLoading: false,
  listError: null,
  total: 0,
  page: 1,
  limit: 20,
  insights: undefined,

  detailsLoading: false,
  detailsError: null,

  createLoading: false,
  createError: null,
  createSuccess: false,

  updateLoading: false,
  updateError: null,
  updateSuccess: false,

  deleteLoading: false,
  deleteError: null,
  deleteSuccess: false,
};

export const fetchLeads = createAsyncThunk<
  FetchLeadsResponse,
  FetchLeadsParams | undefined,
  { rejectValue: string }
>("leads/fetchLeads", async (params, { rejectWithValue }) => {
  try {
    const response = await Client.get(withTenant("/leads"), {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        search: params?.search || undefined,
        status: params?.status || undefined,
        assigned_to: params?.assigned_to || undefined,
      },
    });

    return {
      data: response?.data?.data || [],
      total: response?.data?.total || 0,
      page: response?.data?.page || params?.page || 1,
      limit: response?.data?.limit || params?.limit || 20,
      insights: response?.data?.insights || undefined,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch leads",
    );
  }
});

export const fetchLeadById = createAsyncThunk<
  FetchLeadByIdResponse,
  string,
  { rejectValue: string }
>("leads/fetchLeadById", async (id, { rejectWithValue }) => {
  try {
    const response = await Client.get(withTenant(`/leads/${id}`));

    return {
      data: response?.data?.data,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch lead details",
    );
  }
});

export const createLead = createAsyncThunk<
  CreateLeadResponse,
  CreateLeadPayload,
  { rejectValue: string }
>("leads/createLead", async (payload, { rejectWithValue }) => {
  try {
    const response = await Client.post(withTenant("/leads"), payload);

    return {
      message: response?.data?.message || "Lead created successfully",
      data: response?.data?.data,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to create lead",
    );
  }
});

export const updateLead = createAsyncThunk<
  UpdateLeadResponse,
  UpdateLeadPayload,
  { rejectValue: string }
>("leads/updateLead", async (payload, { rejectWithValue }) => {
  try {
    const { id, ...restPayload } = payload;

    const response = await Client.patch(
      withTenant(`/leads/${id}`),
      restPayload,
    );

    return {
      message: response?.data?.message || "Lead updated successfully",
      data: response?.data?.data,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to update lead",
    );
  }
});

export const deleteLead = createAsyncThunk<
  DeleteLeadResponse,
  string,
  { rejectValue: string }
>("leads/deleteLead", async (id, { rejectWithValue }) => {
  try {
    const response = await Client.delete(withTenant(`/leads/${id}`));

    return {
      message: response?.data?.message || "Lead deleted successfully",
      id,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to delete lead",
    );
  }
});

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    resetLeadsState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;

      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;

      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteSuccess = false;

      state.detailsLoading = false;
      state.detailsError = null;
    },
    resetLeadsListState: (state) => {
      state.listLoading = false;
      state.listError = null;
      state.leads = [];
      state.total = 0;
      state.page = 1;
      state.limit = 20;
      state.insights = undefined;
    },
    resetLeadDetailsState: (state) => {
      state.leadDetails = null;
      state.detailsLoading = false;
      state.detailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchLeads.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.listLoading = false;
        state.leads = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.insights = action.payload.insights;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch leads";
      })

      // detail
      .addCase(fetchLeadById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.leadDetails = action.payload.data;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload || "Failed to fetch lead details";
      })

      // create
      .addCase(createLead.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.leadDetails = action.payload.data;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create lead";
        state.createSuccess = false;
      })

      // update
      .addCase(updateLead.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.leadDetails = action.payload.data;
        state.leads = state.leads.map((item) =>
          item.id === action.payload.data.id ? action.payload.data : item,
        );
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update lead";
        state.updateSuccess = false;
      })

      // delete
      .addCase(deleteLead.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        state.leads = state.leads.filter(
          (item) => item.id !== action.payload.id,
        );

        if (state.leadDetails?.id === action.payload.id) {
          state.leadDetails = null;
        }
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete lead";
        state.deleteSuccess = false;
      });
  },
});

export const { resetLeadsState, resetLeadsListState, resetLeadDetailsState } =
  leadsSlice.actions;

export default leadsSlice.reducer;
