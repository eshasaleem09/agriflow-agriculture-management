import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,

  reducers: {
    // Add equipment
    addEquipment: (state, action) => {
      state.push(action.payload);
    },

    // Update equipment details
    updateEquipment: (state, action) => {
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

    // Delete equipment
    deleteEquipment: (state, action) => {
      return state.filter(
        (item) => String(item.id) !== String(action.payload)
      );
    },

    // Update equipment status
    updateEquipmentStatus: (state, action) => {
      const equipment = state.find(
        (item) =>
          String(item.id) === String(action.payload.id)
      );

      if (equipment) {
        equipment.status = action.payload.status;
      }
    },

    // Update last service date
    updateLastServiceDate: (state, action) => {
      const equipment = state.find(
        (item) =>
          String(item.id) === String(action.payload.id)
      );

      if (equipment) {
        equipment.lastServiceDate = action.payload.lastServiceDate;
      }
    },
  },
});

export const {
  addEquipment,
  updateEquipment,
  deleteEquipment,
  updateEquipmentStatus,
  updateLastServiceDate,
} = equipmentSlice.actions;

export default equipmentSlice.reducer;