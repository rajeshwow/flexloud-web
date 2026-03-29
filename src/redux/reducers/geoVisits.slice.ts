import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type GeoVisitItem = {
  id: string;
  tenant_id: string;
  module_name:
    | "lead"
    | "contact"
    | "organization"
    | "task"
    | "interaction"
    | "attendance";
  record_id: string;
  user_id: string;
  check_in_at: string;
  check_out_at: string | null;
  check_in_lat: number;
  check_in_lng: number;
  check_in_address: string | null;
  check_out_lat: number | null;
  check_out_lng: number | null;
  check_out_address: string | null;
  target_lat: number | null;
  target_lng: number | null;
  distance_from_target_meters: number | null;
  status: "checked_in" | "checked_out" | "cancelled";
  notes: string | null;
  geo_photo_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type CreateGeoVisitPayload = {
  module_name: GeoVisitItem["module_name"];
  record_id: string;
  check_in_lat: number;
  check_in_lng: number;
  check_in_address?: string | null;
  target_lat?: number | null;
  target_lng?: number | null;
  notes?: string | null;
  geo_photo_url?: string | null;
  metadata?: Record<string, any>;
};

export type CheckOutGeoVisitPayload = {
  id: string;
  check_out_lat: number;
  check_out_lng: number;
  check_out_address?: string | null;
  notes?: string | null;
};

export type GetGeoVisitsParams = {
  module_name?: GeoVisitItem["module_name"];
  record_id?: string;
  user_id?: string;
  status?: GeoVisitItem["status"];
  limit?: number;
  offset?: number;
};

type GeoVisitsState = {
  list: GeoVisitItem[];
  total: number;
  loading: boolean;
  createLoading: boolean;
  checkOutLoading: boolean;
  currentOpenVisit: GeoVisitItem | null;
  error: string | null;
};

const initialState: GeoVisitsState = {
  list: [],
  total: 0,
  loading: false,
  createLoading: false,
  checkOutLoading: false,
  currentOpenVisit: null,
  error: null,
};

export const fetchGeoVisits = createAsyncThunk(
  "geoVisits/fetchGeoVisits",
  async (params: GetGeoVisitsParams = {}, { rejectWithValue }) => {
    try {
      const response = await Client.get(withTenant("/geo-visits"), { params });
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch geo visits",
      );
    }
  },
);

export const createGeoVisit = createAsyncThunk(
  "geoVisits/createGeoVisit",
  async (payload: CreateGeoVisitPayload, { rejectWithValue }) => {
    try {
      const response = await Client.post(withTenant("/geo-visits"), payload);
      return response?.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create geo visit",
      );
    }
  },
);

export const checkOutGeoVisit = createAsyncThunk(
  "geoVisits/checkOutGeoVisit",
  async (payload: CheckOutGeoVisitPayload, { rejectWithValue }) => {
    try {
      const response = await Client.patch(
        withTenant(`/geo-visits/${payload.id}/check-out`),
        {
          check_out_lat: payload.check_out_lat,
          check_out_lng: payload.check_out_lng,
          check_out_address: payload.check_out_address || null,
          notes: payload.notes || null,
        },
      );
      return response?.data?.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to check out geo visit",
      );
    }
  },
);

const geoVisitsSlice = createSlice({
  name: "geoVisits",
  initialState,
  reducers: {
    resetGeoVisitsState: () => initialState,
    resetGeoVisitsListState: (state) => {
      state.list = [];
      state.total = 0;
      state.currentOpenVisit = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeoVisits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeoVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data || [];
        state.total = action.payload?.total || 0;
        state.currentOpenVisit =
          (action.payload?.data || []).find(
            (item: GeoVisitItem) =>
              item.status === "checked_in" && !item.check_out_at,
          ) || null;
      })
      .addCase(fetchGeoVisits.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch geo visits";
      })

      .addCase(createGeoVisit.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createGeoVisit.fulfilled, (state, action) => {
        state.createLoading = false;
        state.list = [action.payload, ...state.list];
        state.currentOpenVisit = action.payload;
        state.total += 1;
      })
      .addCase(createGeoVisit.rejected, (state, action) => {
        state.createLoading = false;
        state.error =
          (action.payload as string) || "Failed to create geo visit";
      })

      .addCase(checkOutGeoVisit.pending, (state) => {
        state.checkOutLoading = true;
        state.error = null;
      })
      .addCase(checkOutGeoVisit.fulfilled, (state, action) => {
        state.checkOutLoading = false;
        state.list = state.list.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
        if (state.currentOpenVisit?.id === action.payload.id) {
          state.currentOpenVisit = null;
        }
      })
      .addCase(checkOutGeoVisit.rejected, (state, action) => {
        state.checkOutLoading = false;
        state.error =
          (action.payload as string) || "Failed to check out geo visit";
      });
  },
});

export const { resetGeoVisitsState, resetGeoVisitsListState } =
  geoVisitsSlice.actions;
export default geoVisitsSlice.reducer;
