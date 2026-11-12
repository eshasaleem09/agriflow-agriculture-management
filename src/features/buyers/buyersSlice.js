import { createSlice } from "@reduxjs/toolkit";

const buyersSlice = createSlice({
  name: "buyers",
  initialState: [],
  reducers: {
    setBuyers: (state, action) => action.payload,

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
  setBuyers,
  addBuyer,
  updateBuyer,
  deleteBuyer,
} = buyersSlice.actions;

export default buyersSlice.reducer;