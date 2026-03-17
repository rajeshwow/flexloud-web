import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type ProductItem = {
  id: string;
  tenant_id?: string;

  name: string;
  part_number?: string | null;
  hsn_code: string;
  unit_uqc?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  description?: string | null;

  assigned_to?: string | null;
  assigned_to_name?: string | null;
  status: "active" | "inactive";

  cost_price_currency?: string | null;
  cost_price?: number | null;
  msp_currency?: string | null;
  msp?: number | null;
  selling_price_currency?: string | null;
  selling_price?: number | null;
  tax?: string | null;

  opening_stock?: number | null;
  opening_stock_value?: number | null;
  stock_on_hand?: number | null;
  committed_stock?: number | null;
  available_for_sale?: number | null;
  qty_to_be_invoiced_shipped?: number | null;
  qty_to_be_received_billed?: number | null;

  created_at?: string;
  updated_at?: string;
};

export type CreateProductPayload = {
  slug: string;
  name: string;
  part_number?: string | null;
  hsn_code: string;
  unit_uqc?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  description?: string | null;

  assigned_to?: string | null;
  status?: "active" | "inactive";

  cost_price_currency?: string;
  cost_price?: number;
  msp_currency?: string;
  msp?: number;
  selling_price_currency?: string;
  selling_price?: number;
  tax?: string | null;

  opening_stock?: number;
  opening_stock_value?: number;
  stock_on_hand?: number;
  committed_stock?: number;
  available_for_sale?: number;
  qty_to_be_invoiced_shipped?: number;
  qty_to_be_received_billed?: number;
};

export type UpdateProductPayload = Partial<
  Omit<CreateProductPayload, "slug">
> & {
  slug: string;
  id: string;
};

export type GetProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  manufacturer?: string;
  assigned_to?: string;
};

type ProductListResponse = {
  statusCode: number;
  message: string;
  data: ProductItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
};

type ProductSingleResponse = {
  statusCode: number;
  message: string;
  data: ProductItem;
};

type ProductsState = {
  loading: boolean;
  createLoading: boolean;
  detailLoading: boolean;
  updateLoading: boolean;

  error: string | null;

  productList: ProductItem[];
  productListPagination: {
    page: number;
    limit: number;
    total: number;
  };

  selectedProduct: ProductItem | null;

  createProductSuccess: boolean;
  updateProductSuccess: boolean;
};

const initialState: ProductsState = {
  loading: false,
  createLoading: false,
  detailLoading: false,
  updateLoading: false,

  error: null,

  productList: [],
  productListPagination: {
    page: 1,
    limit: 10,
    total: 0,
  },

  selectedProduct: null,

  createProductSuccess: false,
  updateProductSuccess: false,
};

export const getProducts = createAsyncThunk<
  ProductListResponse,
  GetProductsParams,
  { rejectValue: any }
>("products/getProducts", async (params, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      manufacturer,
      assigned_to,
    } = params;

    const res = await Client.get(withTenant(`/products`), {
      params: {
        page,
        limit,
        search,
        status,
        category,
        manufacturer,
        assigned_to,
      },
    });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || { message: "Failed to fetch products" },
    );
  }
});

export const createProduct = createAsyncThunk<
  ProductSingleResponse,
  CreateProductPayload,
  { rejectValue: any }
>("products/createProduct", async (payload, { rejectWithValue }) => {
  try {
    const { slug, ...body } = payload;
    const res = await Client.post(withTenant(`/products`), body);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || { message: "Failed to create product" },
    );
  }
});

export const getProductById = createAsyncThunk<
  ProductSingleResponse,
  { slug: string; id: string },
  { rejectValue: any }
>("products/getProductById", async ({ slug, id }, { rejectWithValue }) => {
  try {
    const res = await Client.get(withTenant(`/products/${id}`));
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || { message: "Failed to fetch product details" },
    );
  }
});

export const updateProduct = createAsyncThunk<
  ProductSingleResponse,
  UpdateProductPayload,
  { rejectValue: any }
>("products/updateProduct", async (payload, { rejectWithValue }) => {
  try {
    const { slug, id, ...body } = payload;
    const res = await Client.patch(withTenant(`/products/${id}`), body);
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data || { message: "Failed to update product" },
    );
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetProductsState: (state) => {
      state.loading = false;
      state.createLoading = false;
      state.detailLoading = false;
      state.updateLoading = false;
      state.error = null;
      state.createProductSuccess = false;
      state.updateProductSuccess = false;
    },

    resetProductsListState: (state) => {
      state.productList = [];
      state.productListPagination = {
        page: 1,
        limit: 10,
        total: 0,
      };
      state.loading = false;
      state.error = null;
    },

    resetSelectedProductState: (state) => {
      state.selectedProduct = null;
      state.detailLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // getProducts
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.productList = action.payload?.data || [];
        state.productListPagination = action.payload?.pagination || {
          page: 1,
          limit: 10,
          total: action.payload?.data?.length || 0,
        };
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error.message ||
          "Failed to fetch products";
      })

      // createProduct
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.createProductSuccess = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createProductSuccess = true;
        state.selectedProduct = action.payload?.data || null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.createProductSuccess = false;
        state.error =
          (action.payload as any)?.message ||
          action.error.message ||
          "Failed to create product";
      })

      // getProductById
      .addCase(getProductById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload?.data || null;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error =
          (action.payload as any)?.message ||
          action.error.message ||
          "Failed to fetch product details";
      })

      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.updateProductSuccess = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateProductSuccess = true;
        state.selectedProduct = action.payload?.data || null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateProductSuccess = false;
        state.error =
          (action.payload as any)?.message ||
          action.error.message ||
          "Failed to update product";
      });
  },
});

export const {
  resetProductsState,
  resetProductsListState,
  resetSelectedProductState,
} = productsSlice.actions;

export default productsSlice.reducer;
