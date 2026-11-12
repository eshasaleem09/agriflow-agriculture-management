import { createSlice } from "@reduxjs/toolkit";

const tasksSlice = createSlice({
  name: "tasks",
  initialState: [],
  reducers: {
    setTasks: (state, action) => action.payload,

    addTask: (state, action) => {
      state.push(action.payload);
    },

    updateTask: (state, action) => {
      const index = state.findIndex(
        (task) => task.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteTask: (state, action) => {
      return state.filter(
        (task) => task.id !== action.payload
      );
    },

    markTaskDone: (state, action) => {
      const task = state.find(
        (task) => task.id === action.payload
      );

      if (task) {
        task.status = "Done";
        task.completedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  markTaskDone,
} = tasksSlice.actions;

export default tasksSlice.reducer;