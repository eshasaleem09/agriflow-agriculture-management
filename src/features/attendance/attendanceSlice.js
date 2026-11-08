import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,

  reducers: {
    // Add attendance record
    addAttendance: (state, action) => {
      state.push(action.payload);
    },

    // Update attendance record
    updateAttendance: (state, action) => {
      const index = state.findIndex(
        (record) =>
          String(record.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...action.payload,
        };
      }
    },

    // Delete attendance record
    deleteAttendance: (state, action) => {
      return state.filter(
        (record) =>
          String(record.id) !== String(action.payload)
      );
    },
  },
});

export const {
  addAttendance,
  updateAttendance,
  deleteAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;