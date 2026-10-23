import { createSlice } from "@reduxjs/toolkit";

const activitySlice = createSlice({
  name: "activity",
  initialState: [],

  reducers: {
    addActivity: (state, action) => {
      state.unshift(action.payload);

      // Keep the latest 500 activities
      if (state.length > 500) {
        state.length = 500;
      }
    },

    clearActivity: () => [],
  },
});

export const { addActivity, clearActivity } = activitySlice.actions;

export default activitySlice.reducer;