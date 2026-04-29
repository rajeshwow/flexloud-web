import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type OpportunityItem = {
  id: string;
  tenant_id?: string;

  opportunity_number: string;
  name: string;
  sales_stage?: string | null;
  amount?: number | null;
  close_date?: string | null;

  user_id?: string | null;
  user_name?: string | null;

  phone?: string | null;
  email?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type CreateOpportunityPayload = {
  opportunity_number: string;
  name: string;
  sales_stage?: string | null;
  amount?: number | null;
  close_date?: string | null;
  user_id?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type UpdateOpportunityPayload = {
  id: string;
  opportunity_number?: string;
  name?: string;
  sales_stage?: string | null;
  amount?: number | null;
  close_date?: string | null;
  user_id?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type GetOpportunitiesParams = {
  page?: number;
  limit?: number;
  search?: string;

  opportunity_number?: string;
  name?: string;
  sales_stage?: string;
  amount?: string;
  close_date?: string;
  user?: string;
  created_at?: string;
};

type GetOpportunitiesResponse = {
  data: OpportunityItem[];
  total: number;
  page: number;
  limit: number;
};

type CreateOpportunityResponse = {
  message: string;
  data: OpportunityItem;
};

type UpdateOpportunityResponse = {
  message: string;
  data: OpportunityItem;
};

type OpportunitiesState = {
  opportunities: OpportunityItem[];
  opportunityDetails: OpportunityItem | null;

  listLoading: boolean;
  listError: string | null;
  total: number;
  page: number;
  limit: number;

  createLoading: boolean;
  createError: string | null;
  createSuccess: boolean;

  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
};

const initialState: OpportunitiesState = {
  opportunities: [],
  opportunityDetails: null,

  listLoading: false,
  listError: null,
  total: 0,
  page: 1,
  limit: 20,

  createLoading: false,
  createError: null,
  createSuccess: false,

  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

export const fetchOpportunities = createAsyncThunk<
  GetOpportunitiesResponse,
  GetOpportunitiesParams | undefined,
  { rejectValue: string }
>("opportunities/fetchOpportunities", async (params, { rejectWithValue }) => {
  try {
    const response = await Client.get(withTenant("/opportunities"), {
      params,
    });

    return {
      data: response?.data?.data || [],
      total: response?.data?.total || 0,
      page: response?.data?.page || params?.page || 1,
      limit: response?.data?.limit || params?.limit || 20,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch opportunities",
    );
  }
});

export const getOpportunityById = createAsyncThunk(
  "opportunities/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant(`/opportunities/${id}`));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch opportunity",
      );
    }
  },
);

export const createOpportunity = createAsyncThunk<
  CreateOpportunityResponse,
  CreateOpportunityPayload,
  { rejectValue: string }
>("opportunities/createOpportunity", async (payload, { rejectWithValue }) => {
  try {
    const response = await Client.post(withTenant("/opportunities"), payload);

    return {
      message: response?.data?.message || "Opportunity created successfully",
      data: response?.data?.data,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to create opportunity",
    );
  }
});

export const updateOpportunity = createAsyncThunk<
  UpdateOpportunityResponse,
  UpdateOpportunityPayload,
  { rejectValue: string }
>("opportunities/updateOpportunity", async (payload, { rejectWithValue }) => {
  try {
    const { id, ...restPayload } = payload;

    const response = await Client.patch(
      withTenant(`/opportunities/${id}`),
      restPayload,
    );

    return {
      message: response?.data?.message || "Opportunity updated successfully",
      data: response?.data?.data,
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to update opportunity",
    );
  }
});

const opportunitiesSlice = createSlice({
  name: "opportunities",
  initialState,
  reducers: {
    resetOpportunitiesState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;

      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    resetOpportunitiesListState: (state) => {
      state.listLoading = false;
      state.listError = null;
      state.opportunities = [];
      state.total = 0;
      state.page = 1;
      state.limit = 20;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchOpportunities.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.listLoading = false;
        state.opportunities = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchOpportunities.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch opportunities";
      })

      // create
      .addCase(createOpportunity.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createOpportunity.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.opportunityDetails = action.payload.data;
      })
      .addCase(createOpportunity.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create opportunity";
        state.createSuccess = false;
      })

      // update
      .addCase(updateOpportunity.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateOpportunity.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.opportunityDetails = action.payload.data;

        state.opportunities = state.opportunities.map((item) =>
          item.id === action.payload.data.id ? action.payload.data : item,
        );
      })
      .addCase(updateOpportunity.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update opportunity";
        state.updateSuccess = false;
      });
  },
});

export const { resetOpportunitiesState, resetOpportunitiesListState } =
  opportunitiesSlice.actions;

export default opportunitiesSlice.reducer;
