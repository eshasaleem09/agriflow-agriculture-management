import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const workersSlice = createSlice({
  name: "workers",
  initialState,

  reducers: {
    // Add a new worker
    addWorker: (state, action) => {
      state.push(action.payload);
    },

    // Update existing worker
    updateWorker: (state, action) => {
      const index = state.findIndex(
        (worker) =>
          String(worker.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...action.payload,
        };
      }
    },

    // Delete worker
    deleteWorker: (state, action) => {
      return state.filter(
        (worker) =>
          String(worker.id) !== String(action.payload)
      );
    },

    // Activate or deactivate worker
    updateWorkerStatus: (state, action) => {
      const worker = state.find(
        (item) =>
          String(item.id) === String(action.payload.id)
      );

      if (worker) {
        worker.status = action.payload.status;
      }
    },
  },
});

export const {
  addWorker,
  updateWorker,
  deleteWorker,
  updateWorkerStatus,
} = workersSlice.actions;

export default workersSlice.reducer;