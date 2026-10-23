import { createSlice } from "@reduxjs/toolkit";

const buyersSlice = createSlice({
  name: "buyers",
  initialState: [],

  reducers: {
    addBuyer: (state, action) => {
      state.push(action.payload);
    },

    updateBuyer: (state, action) => {
      const index = state.findIndex(
        (buyer) => buyer.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteBuyer: (state, action) => {
      return state.filter(
        (buyer) => buyer.id !== action.payload
      );
    },
  },
});

export const {
  addBuyer,
  updateBuyer,
  deleteBuyer,
} = buyersSlice.actions;

export default buyersSlice.reducer;