import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  schedule: [
    {
      id: 1,
      cropName: "Wheat",
      field: "Field A",
      plannedDate: "2026-10-24",
      quantity: 1000,
      status: "Planned",
    },
    {
      id: 2,
      cropName: "Rice",
      field: "Field B",
      plannedDate: "2026-10-25",
      quantity: 1500,
      status: "Planned",
    },
    {
      id: 3,
      cropName: "Corn",
      field: "Field C",
      plannedDate: "2026-10-20",
      quantity: 800,
      status: "Completed",
    },
  ],

  orders: [
    {
      id: "ORD-1024",
      customer: "Ahmed Khan",
      crop: "Wheat",
      quantity: 500,
      status: "Delivered",
    },
    {
      id: "ORD-1025",
      customer: "Fatima Ali",
      crop: "Rice",
      quantity: 300,
      status: "Pending",
    },
    {
      id: "ORD-1026",
      customer: "Usman Malik",
      crop: "Corn",
      quantity: 200,
      status: "Processing",
    },
  ],
};

const harvestSlice = createSlice({
  name: "harvest",
  initialState,

  reducers: {
    addHarvest: (state, action) => {
      state.schedule.push(action.payload);
    },

    updateHarvest: (state, action) => {
      const index = state.schedule.findIndex(
        (item) => item.id === action.payload.id
      );

      if (index !== -1) {
        state.schedule[index] = action.payload;
      }
    },

    deleteHarvest: (state, action) => {
      state.schedule = state.schedule.filter(
        (item) => item.id !== action.payload
      );
    },

    completeHarvest: (state, action) => {
      const item = state.schedule.find(
        (record) => record.id === action.payload
      );

      if (item && item.status !== "Completed") {
        item.status = "Completed";
        item.completedAt = new Date().toISOString();
      }
    },

    addOrder: (state, action) => {
      state.orders.push(action.payload);
    },

    updateOrder: (state, action) => {
      const index = state.orders.findIndex(
        (order) => order.id === action.payload.id
      );

      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },

    deleteOrder: (state, action) => {
      state.orders = state.orders.filter(
        (order) => order.id !== action.payload
      );
    },
  },
});

export const {
  addHarvest,
  updateHarvest,
  deleteHarvest,
  completeHarvest,
  addOrder,
  updateOrder,
  deleteOrder,
} = harvestSlice.actions;

export const selectHarvestSchedule = (state) =>
  state.harvest.schedule;

export const selectOrders = (state) => state.harvest.orders;

export default harvestSlice.reducer;