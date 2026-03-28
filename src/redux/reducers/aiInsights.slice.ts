import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";

export type InsightPriority = "low" | "medium" | "high";
export type LeadTemperature = "Hot" | "Warm" | "Cold";

export type NextBestAction = {
  title: string;
  description: string;
  priority: InsightPriority;
};

export type LeadScore = {
  score: number;
  label: LeadTemperature;
  reasons: string[];
};

export type ReminderSuggestion = {
  shouldCreateReminder: boolean;
  dueLabel: string | null;
  reason: string;
};

export type LeadAIInsights = {
  nextBestAction: NextBestAction;
  leadScore: LeadScore;
  reminderSuggestion: ReminderSuggestion;
};

type AIInsightsState = {
  leadInsights: LeadAIInsights | null;
  leadInsightsLoading: boolean;
  leadInsightsError: string | null;
};

const initialState: AIInsightsState = {
  leadInsights: null,
  leadInsightsLoading: false,
  leadInsightsError: null,
};

export const fetchLeadAIInsights = createAsyncThunk<
  LeadAIInsights,
  string,
  { rejectValue: string }
>("aiInsights/fetchLeadAIInsights", async (leadId, { rejectWithValue }) => {
  try {
    const response = await Client.get(
      withTenant(`/ai-insights/leads/${leadId}`),
    );

    return response?.data?.data as LeadAIInsights;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch AI insights",
    );
  }
});

const aiInsightsSlice = createSlice({
  name: "aiInsights",
  initialState,
  reducers: {
    resetLeadAIInsightsState: (state) => {
      state.leadInsights = null;
      state.leadInsightsLoading = false;
      state.leadInsightsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeadAIInsights.pending, (state) => {
        state.leadInsightsLoading = true;
        state.leadInsightsError = null;
      })
      .addCase(fetchLeadAIInsights.fulfilled, (state, action) => {
        state.leadInsightsLoading = false;
        state.leadInsights = action.payload;
      })
      .addCase(fetchLeadAIInsights.rejected, (state, action) => {
        state.leadInsightsLoading = false;
        state.leadInsightsError =
          action.payload || "Failed to fetch AI insights";
      });
  },
});

export const { resetLeadAIInsightsState } = aiInsightsSlice.actions;
export default aiInsightsSlice.reducer;
