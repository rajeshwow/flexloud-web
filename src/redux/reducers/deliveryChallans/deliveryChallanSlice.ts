import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../../shared/Utils/api-client";
import { withTenant } from "../../../shared/Utils/utils";

export type DeliveryChallanLineItemPayload = {
  id?: string;
  product_id?: string | null;
  item_name: string;
  sku?: string | null;
  quantity: number;
  rate: number;
  discount?: number;
  tax?: number;
  cgst?: number;
  sgst?: number;
  amount: number;
};

export type CreateDeliveryChallanPayload = {
  customer_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;

  reference_no?: string | null;
  challan_date: string;
  challan_type: string;

  notes?: string | null;

  subtotal: number;
  discount_percent?: number;
  discount_amount?: number;
  adjustment?: number;
  total: number;

  status?: "draft" | "created" | "cancelled" | string;

  items: DeliveryChallanLineItemPayload[];
};

export type UpdateDeliveryChallanPayload =
  Partial<CreateDeliveryChallanPayload>;

export type DeliveryChallanItem = DeliveryChallanLineItemPayload & {
  id: string;
  tenant_id?: string;
  delivery_challan_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DeliveryChallan = {
  tax: any;
  tax_amount: any;
  id: string;
  tenant_id?: string;

  challan_number: string;
  reference_no?: string | null;

  customer_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;

  challan_date: string;
  challan_type: string;

  notes?: string | null;

  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  adjustment: number;
  total: number;

  status: string;

  created_at?: string;
  updated_at?: string;

  items?: DeliveryChallanItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

export type GetDeliveryChallansParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type SendDeliveryChallanEmailPayload = {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  attachPdf?: boolean;
};

type DeliveryChallanState = {
  list: any[];
  details: any | null;

  loading: boolean;
  detailsLoading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  error: string | null;

  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

const initialState: DeliveryChallanState = {
  list: [],
  details: null,

  loading: false,
  detailsLoading: false,
  creating: false,
  updating: false,
  deleting: false,

  error: null,

  meta: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const fetchDeliveryChallans = createAsyncThunk(
  "deliveryChallans/fetchDeliveryChallans",
  async (params: GetDeliveryChallansParams = {}, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant("/delivery-challans"), {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          search: params.search || undefined,
          status: params.status || undefined,
        },
      });

      return {
        data: res?.data?.data || [],
        meta: res?.data?.meta || {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
        },
      };
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const sendDeliveryChallanEmail = createAsyncThunk(
  "deliveryChallans/sendDeliveryChallanEmail",
  async (payload: SendDeliveryChallanEmailPayload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload;

      const res = await Client.post(
        withTenant(`/delivery-challans/${id}/send-email`),
        body,
      );

      return res?.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchDeliveryChallanById = createAsyncThunk(
  "deliveryChallans/fetchDeliveryChallanById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await Client.get(withTenant(`/delivery-challans/${id}`));
      return res?.data?.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createDeliveryChallan = createAsyncThunk(
  "deliveryChallans/createDeliveryChallan",
  async (payload: CreateDeliveryChallanPayload, { rejectWithValue }) => {
    try {
      const res = await Client.post(withTenant("/delivery-challans"), payload);
      return res?.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateDeliveryChallan = createAsyncThunk(
  "deliveryChallans/updateDeliveryChallan",
  async (
    {
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDeliveryChallanPayload;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await Client.patch(
        withTenant(`/delivery-challans/${id}`),
        payload,
      );
      return res?.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteDeliveryChallan = createAsyncThunk(
  "deliveryChallans/deleteDeliveryChallan",
  async (id: string, { rejectWithValue }) => {
    try {
      await Client.delete(withTenant(`/delivery-challans/${id}`));
      return id;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const deliveryChallanSlice = createSlice({
  name: "deliveryChallans",
  initialState,
  reducers: {
    resetDeliveryChallanState: (state) => {
      state.error = null;
      state.creating = false;
      state.updating = false;
      state.deleting = false;
    },

    resetDeliveryChallanDetails: (state) => {
      state.details = null;
      state.detailsLoading = false;
      state.error = null;
    },

    resetDeliveryChallanListState: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
      state.meta = {
        page: 1,
        limit: 20,
        total: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder

      // list
      .addCase(fetchDeliveryChallans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryChallans.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data?.list || [];
        state.meta = action.payload?.data?.meta || initialState.meta;
      })
      .addCase(fetchDeliveryChallans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // details
      .addCase(fetchDeliveryChallanById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryChallanById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.details = action.payload || null;
      })
      .addCase(fetchDeliveryChallanById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      })

      // create
      .addCase(createDeliveryChallan.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createDeliveryChallan.fulfilled, (state, action) => {
        state.creating = false;

        if (action.payload) {
          state.list = [action.payload, ...state.list];
          state.meta.total += 1;
        }
      })
      .addCase(createDeliveryChallan.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })

      // update
      .addCase(updateDeliveryChallan.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateDeliveryChallan.fulfilled, (state, action) => {
        state.updating = false;

        if (action.payload) {
          state.details = {
            ...(state.details || {}),
            ...action.payload,
          } as DeliveryChallan;

          state.list = state.list.map((item) =>
            item.id === action.payload.id
              ? { ...item, ...action.payload }
              : item,
          );
        }
      })
      .addCase(updateDeliveryChallan.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })

      // delete
      .addCase(deleteDeliveryChallan.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDeliveryChallan.fulfilled, (state, action) => {
        state.deleting = false;
        state.list = state.list.filter((item) => item.id !== action.payload);

        if (state.details?.id === action.payload) {
          state.details = null;
        }

        state.meta.total = Math.max(state.meta.total - 1, 0);
      })
      .addCase(deleteDeliveryChallan.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetDeliveryChallanState,
  resetDeliveryChallanDetails,
  resetDeliveryChallanListState,
} = deliveryChallanSlice.actions;

export default deliveryChallanSlice.reducer;
