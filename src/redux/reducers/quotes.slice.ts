import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type QuoteLineItem = {
  id?: string;
  group_name?: string;
  sort_order?: number;
  item_type: "product" | "service";
  product_name?: string;
  service_name?: string;
  hsn_code?: string;
  quantity: number;
  list_price?: number;
  discount_value?: number;
  discount_type?: "pct" | "amount";
  sale_price: number;
  tax_amount?: number;
  tax_type_1?: string;
  tax_type_2?: string;
  description?: string;
  note?: string;
  line_total: number;
};

export type QuoteItem = {
  id: string;
  quote_number: string;
  title: string;
  quotation_date: string;
  valid_until: string;
  validation_period?: number | null;
  quote_stage: string;
  organization_id?: string | null;
  contact_id?: string | null;
  opportunity_id?: string | null;
  assigned_to?: string | null;
  company_name?: string | null;
  gstin?: string | null;
  currency?: string | null;
  terms_condition?: string | null;
  terms_condition_description?: string | null;
  material_delivery_time?: string | null;
  payment_terms?: string | null;
  payment_terms_description?: string | null;
  description?: string | null;
  billing_street?: string | null;
  billing_area?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_country?: string | null;
  billing_postal_code?: string | null;
  shipping_street?: string | null;
  shipping_area?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_country?: string | null;
  shipping_postal_code?: string | null;
  subtotal?: number;
  discount?: number;
  total?: number;
  freight_charges?: number;
  freight_type?: string | null;
  tax_on_freight?: number;
  tax?: number;
  grand_total?: number;
  created_at?: string;
  updated_at?: string;
  line_items?: QuoteLineItem[];
};

export type GetQuotesParams = {
  search?: string;
  page?: number;
  limit?: number;
};

type QuotesState = {
  list: QuoteItem[];
  details: QuoteItem | null;
  listLoading: boolean;
  detailsLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  error: string | null;
};

const initialState: QuotesState = {
  list: [],
  details: null,
  listLoading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,
  error: null,
};

export const fetchQuotes = createAsyncThunk(
  "quotes/fetchQuotes",
  async (params: GetQuotesParams | undefined, thunkAPI) => {
    try {
      const response = await Client.get(withTenant("/quotes"), { params });
      return response?.data?.data || [];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch quotes",
      );
    }
  },
);

export const fetchQuoteDetails = createAsyncThunk(
  "quotes/fetchQuoteDetails",
  async (id: string, thunkAPI) => {
    try {
      const response = await Client.get(withTenant(`/quotes/${id}`));
      return response?.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch quote details",
      );
    }
  },
);

export const createQuote = createAsyncThunk(
  "quotes/createQuote",
  async (payload: Partial<QuoteItem>, thunkAPI) => {
    try {
      const response = await Client.post(withTenant("/quotes"), payload);
      return response?.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to create quote",
      );
    }
  },
);

export const updateQuote = createAsyncThunk(
  "quotes/updateQuote",
  async (
    { id, payload }: { id: string; payload: Partial<QuoteItem> },
    thunkAPI,
  ) => {
    try {
      const response = await Client.patch(withTenant(`/quotes/${id}`), payload);
      return response?.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to update quote",
      );
    }
  },
);

const quotesSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    clearQuoteDetails: (state) => {
      state.details = null;
      state.error = null;
    },
    resetQuotesState: (state) => {
      state.createLoading = false;
      state.updateLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotes.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchQuoteDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchQuoteDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.details = action.payload;
      })
      .addCase(fetchQuoteDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createQuote.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createQuote.fulfilled, (state) => {
        state.createLoading = false;
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateQuote.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateQuote.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updateQuote.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearQuoteDetails, resetQuotesState } = quotesSlice.actions;
export default quotesSlice.reducer;
