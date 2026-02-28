import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";

const config = {
  name: "auth",
};

export const login = createAsyncThunk(
  `${config.name}/login`,
  async (payload: { slug: string; email: string; password: string }) => {
    const { slug, email, password } = payload;

    return await Client.post(`/v1/${slug}/auth/login`, {
      identifier: email,
      password,
    });
  },
);

export const auth = createSlice({
  name: config.name,
  initialState: {
    loading: false,
    token: (localStorage.getItem("token") as string) || "",
    user: null as any,
    error: "" as string,
  },
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.token = "";
      state.user = null;
      state.error = "";
      localStorage.removeItem("token");
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
  },
  extraReducers(builder) {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        // supports token OR accessToken
        const token =
          action?.payload?.data?.data?.token ||
          action?.payload?.data?.token ||
          action?.payload?.data?.data?.accessToken ||
          action?.payload?.data?.accessToken ||
          "";

        state.token = token;
        if (token) localStorage.setItem("token", token);

        // supports user in various shapes
        state.user =
          action?.payload?.data?.data?.user ||
          action?.payload?.data?.user ||
          null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action as any)?.error?.message || "Login failed";
      });
  },
});

export const { reset, setToken } = auth.actions;
export default auth.reducer;
