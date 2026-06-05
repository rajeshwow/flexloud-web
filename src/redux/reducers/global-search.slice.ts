import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type GlobalSearchResultType =
  | "sales_order"
  | "purchase_order"
  | "quote"
  | "product"
  | "organization";

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchResultType;
  module: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  redirectUrl: string;
  score?: number;
};

export type GlobalSearchResponse = {
  query: string;
  results: GlobalSearchResult[];
};

type GlobalSearchState = {
  loading: boolean;
  pageLoading: boolean;
  results: GlobalSearchResult[];
  query: string;
  error: string | null;
};

const initialState: GlobalSearchState = {
  loading: false,
  pageLoading: false,
  results: [],
  query: "",
  error: null,
};

export const fetchGlobalSearchSuggestions = createAsyncThunk(
  "globalSearch/fetchGlobalSearchSuggestions",
  async (
    params: {
      q: string;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const query = new URLSearchParams();

      query.set("q", params.q);
      query.set("limit", String(params.limit || 6));

      const response = await Client.get(
        withTenant(`/global-search?${query.toString()}`),
      );

      return response.data.data as GlobalSearchResponse;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch search suggestions",
      );
    }
  },
);

export const fetchGlobalSearchResults = createAsyncThunk(
  "globalSearch/fetchGlobalSearchResults",
  async (
    params: {
      q: string;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const query = new URLSearchParams();

      query.set("q", params.q);
      query.set("limit", String(params.limit || 20));

      const response = await Client.get(
        withTenant(`/global-search?${query.toString()}`),
      );

      return response.data.data as GlobalSearchResponse;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch search results",
      );
    }
  },
);

const globalSearchSlice = createSlice({
  name: "globalSearch",
  initialState,
  reducers: {
    resetGlobalSearchSuggestions: (state) => {
      state.loading = false;
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalSearchSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalSearchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.query = action.payload.query;
        state.results = action.payload.results || [];
      })
      .addCase(fetchGlobalSearchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.results = [];
        state.error = String(action.payload || "Search failed");
      })

      .addCase(fetchGlobalSearchResults.pending, (state) => {
        state.pageLoading = true;
        state.error = null;
      })
      .addCase(fetchGlobalSearchResults.fulfilled, (state, action) => {
        state.pageLoading = false;
        state.query = action.payload.query;
        state.results = action.payload.results || [];
      })
      .addCase(fetchGlobalSearchResults.rejected, (state, action) => {
        state.pageLoading = false;
        state.results = [];
        state.error = String(action.payload || "Search failed");
      });
  },
});

export const { resetGlobalSearchSuggestions } = globalSearchSlice.actions;

export default globalSearchSlice.reducer;
