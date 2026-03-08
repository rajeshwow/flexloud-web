import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";

export type CreateOrganizationPayload = {
  name: string;
  gst_number?: string | null;
  email?: string | null;
  next_followup_at?: string | null;
  type?: string | null;
  industry?: string | null;
  assigned_to?: string | null;

  billing_street: string;
  billing_area: string;
  billing_postal_code: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;

  shipping_street?: string | null;
  shipping_area?: string | null;
  shipping_postal_code?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_country?: string | null;

  is_shipping_same_as_billing?: boolean;
};

export type OrganizationItem = {
  id: string;
  name: string;
  gst_number: string | null;
  email: string | null;
  next_followup_at: string | null;
  type: string | null;
  industry: string | null;
  assigned_to: string | null;
  assigned_to_name?: string | null;
  created_at: string;
  updated_at: string;
};

export type GetOrganizationsParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type OrganizationState = {
  createLoading: boolean;
  createError: string | null;
  createdOrganization: OrganizationItem | null;

  listLoading: boolean;
  listError: string | null;
  list: OrganizationItem[];
  pagination: PaginationState;
};

const initialState: OrganizationState = {
  createLoading: false,
  createError: null,
  createdOrganization: null,

  listLoading: false,
  listError: null,
  list: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const createOrganization = createAsyncThunk<
  OrganizationItem,
  CreateOrganizationPayload,
  { rejectValue: string }
>("organization/createOrganization", async (payload, thunkAPI) => {
  try {
    const response = await Client.post("/v1/organizations", payload);
    return response.data?.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.data?.message || error?.message || "Failed to create organization",
    );
  }
});

export const getOrganization = createAsyncThunk<
  { data: OrganizationItem[]; pagination: PaginationState },
  GetOrganizationsParams | undefined,
  { rejectValue: string }
>("organization/getOrganization", async (params, thunkAPI) => {
  try {
    const response = await Client.get("/v1/organizations", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || "",
      },
    });

    return {
      data: response.data?.data || [],
      pagination: response.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.data?.message || error?.message || "Failed to get organization",
    );
  }
});

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    resetOrganizationState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createdOrganization = null;
    },
    resetOrganizationListState: (state) => {
      state.listLoading = false;
      state.listError = null;
      state.list = [];
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrganization.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createdOrganization = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create organization";
      })

      .addCase(getOrganization.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getOrganization.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getOrganization.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to get organization";
      });
  },
});

export const { resetOrganizationState, resetOrganizationListState } =
  organizationSlice.actions;

export default organizationSlice.reducer;
