import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,

  reducers: {
    // Add maintenance record
    addMaintenance: (state, action) => {
      state.push(action.payload);
    },

    // Update maintenance record
    updateMaintenance: (state, action) => {
      const index = state.findIndex(
        (item) =>
          String(item.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...action.payload,
        };
      }
    },

    // Delete maintenance record
    deleteMaintenance: (state, action) => {
      return state.filter(
        (item) => String(item.id) !== String(action.payload)
      );
    },
  },
});

export const {
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
} = maintenanceSlice.actions;

export default maintenanceSlice.reducer;