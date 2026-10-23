import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    id: 1,
    name: "NPK Fertilizer",
    category: "Fertilizer",
    quantity: 24,
    unit: "bags",
    minStock: 10,
    usageHistory: [],
  },
  {
    id: 2,
    name: "Wheat Seeds",
    category: "Seeds",
    quantity: 8,
    unit: "bags",
    minStock: 12,
    usageHistory: [],
  },
  {
    id: 3,
    name: "Organic Pesticide",
    category: "Pesticide",
    quantity: 16,
    unit: "litres",
    minStock: 5,
    usageHistory: [],
  },
  {
    id: 4,
    name: "Irrigation Fuel",
    category: "Fuel",
    quantity: 35,
    unit: "litres",
    minStock: 10,
    usageHistory: [],
  },
];

const inventorySlice = createSlice({
  name: "inventory",
  initialState,

  reducers: {
    addInventoryItem: (state, action) => {
      state.push(action.payload);
    },

    updateInventoryItem: (state, action) => {
      const index = state.findIndex(
        (item) => item.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteInventoryItem: (state, action) => {
      return state.filter((item) => item.id !== action.payload);
    },

    recordInventoryUsage: (state, action) => {
      const { id, amount, note, usedBy, usedAt } = action.payload;

      const item = state.find(
        (entry) => entry.id === id
      );

      if (item && amount > 0 && amount <= item.quantity) {
        item.quantity -= amount;

        item.usageHistory.unshift({
          id: Date.now(),
          amount,
          note,
          usedBy,
          usedAt,
        });
      }
    },
  },
});

export const {
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  recordInventoryUsage,
} = inventorySlice.actions;

export default inventorySlice.reducer;