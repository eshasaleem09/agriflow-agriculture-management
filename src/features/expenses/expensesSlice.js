import { createSlice } from "@reduxjs/toolkit";

const expensesSlice = createSlice({
  name: "expenses",
  initialState: [],

  reducers: {
    addExpense: (state, action) => {
      state.push(action.payload);
    },

    updateExpense: (state, action) => {
      const index = state.findIndex(
        (item) => item.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteExpense: (state, action) => {
      return state.filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  addExpense,
  updateExpense,
  deleteExpense,
} = expensesSlice.actions;

export default expensesSlice.reducer;