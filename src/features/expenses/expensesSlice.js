import { createSlice } from "@reduxjs/toolkit";

const expensesSlice = createSlice({
  name: "expenses",
  initialState: [],
  reducers: {
    setExpenses: (state, action) => action.payload,

    addExpense: (state, action) => {
      state.push(action.payload);
    },

    updateExpense: (state, action) => {
      const index = state.findIndex(
        (expense) => expense.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteExpense: (state, action) => {
      return state.filter(
        (expense) => expense.id !== action.payload
      );
    },
  },
});

export const {
  setExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} = expensesSlice.actions;

export default expensesSlice.reducer;