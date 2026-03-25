import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type CreateContactPayload = {
  first_name: string;
  last_name?: string | null;
  mobile?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  organization_id?: string | null;
  assigned_to?: string | null;
};

export type ContactItem = {
  id: string;
  first_name: string;
  last_name: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  organization_id: string | null;
  assigned_to: string | null;
  organization_name?: string | null;
  assigned_to_name?: string | null;
  created_at: string;
  updated_at: string;
  statusCode?: number;
  primary_contact?: string | null;
};

export type GetContactsParams = {
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

type ContactsState = {
  createLoading: boolean;
  createError: string | null;
  createdContact: ContactItem | null;

  listLoading: boolean;
  listError: string | null;
  contactList: ContactItem[];
  pagination: PaginationState;
};

const initialState: ContactsState = {
  createLoading: false,
  createError: null,
  createdContact: null,

  listLoading: false,
  listError: null,
  contactList: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const createContact = createAsyncThunk<
  ContactItem,
  CreateContactPayload,
  { rejectValue: string }
>("contacts/createContact", async (payload, thunkAPI) => {
  try {
    const response = await Client.post(withTenant("/contacts"), payload);
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.data?.message || error?.message || "Failed to create contact",
    );
  }
});

export const fetchContacts = createAsyncThunk(
  "contacts/fetchContacts",
  async (params: GetContactsParams | undefined) => {
    try {
      const response = await Client.get(withTenant("/contacts"), {
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
      return (
        error?.data?.message || error?.message || "Failed to fetch contacts"
      );
    }
  },
);

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    resetContactsState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createdContact = null;
    },
    resetContactsListState: (state) => {
      state.listLoading = false;
      state.listError = null;
      state.contactList = [];
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
      .addCase(createContact.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createdContact = action.payload;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = "Failed to create contact";
      })

      .addCase(fetchContacts.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.listLoading = false;
        state.contactList = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = "Failed to fetch contacts";
      });
  },
});

export const { resetContactsState, resetContactsListState } =
  contactsSlice.actions;

export default contactsSlice.reducer;
