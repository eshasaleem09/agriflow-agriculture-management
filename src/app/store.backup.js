import { configureStore } from "@reduxjs/toolkit";

import cropsReducer from "../features/crops/cropsSlice.js";
import authReducer from "../features/auth/authSlice.js";
import weatherReducer from "../features/weather/weatherSlice.js";
import tasksReducer from "../features/tasks/tasksSlice.js";
import inventoryReducer from "../features/inventory/inventorySlice.js";
import expensesReducer from "../features/expenses/expensesSlice.js";
import activityReducer from "../features/activity/activitySlice.js";
import buyersReducer from "../features/buyers/buyersSlice.js";
import harvestReducer from "../features/harvest/harvestSlice.js";

import { activityLogger } from "./activityLogger.js";

const STORAGE_KEYS = {
  crops: "agriflow-crops",
  tasks: "agriflow-tasks",
  inventory: "agriflow-inventory",
  expenses: "agriflow-expenses",
  activity: "agriflow-activity",
  session: "agriflow-session",
  buyers: "agriflow-buyers",
  harvest: "agriflow-harvest",
};

// Safely restore array data from localStorage
function loadSavedArray(key) {
  try {
    const saved = localStorage.getItem(key);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(`Could not load ${key}:`, error);
  }

  return undefined;
}

export const store = configureStore({
  reducer: {
    crops: cropsReducer,
    auth: authReducer,
    weather: weatherReducer,
    tasks: tasksReducer,
    inventory: inventoryReducer,
    expenses: expensesReducer,
    activity: activityReducer,
    buyers: buyersReducer,
    harvest: harvestReducer
  },

  preloadedState: {
    crops: loadSavedArray(STORAGE_KEYS.crops),
    tasks: loadSavedArray(STORAGE_KEYS.tasks),
    inventory: loadSavedArray(STORAGE_KEYS.inventory),
    expenses: loadSavedArray(STORAGE_KEYS.expenses),
    activity: loadSavedArray(STORAGE_KEYS.activity),
    buyers: loadSavedArray(STORAGE_KEYS.buyers),
    harvest: (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.harvest);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        Array.isArray(parsed.schedule) &&
        Array.isArray(parsed.orders)
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Could not load harvest data:", error);
  }

  return undefined;
})(),
    
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(activityLogger),
});

// Persist supported application data
store.subscribe(() => {
  try {
    const state = store.getState();

    localStorage.setItem(
      STORAGE_KEYS.crops,
      JSON.stringify(state.crops)
    );

    localStorage.setItem(
      STORAGE_KEYS.tasks,
      JSON.stringify(state.tasks)
    );

    localStorage.setItem(
      STORAGE_KEYS.inventory,
      JSON.stringify(state.inventory)
    );

    localStorage.setItem(
      STORAGE_KEYS.expenses,
      JSON.stringify(state.expenses)
    );

    localStorage.setItem(
      STORAGE_KEYS.activity,
      JSON.stringify(state.activity)
    );
    localStorage.setItem(
  STORAGE_KEYS.buyers,
  JSON.stringify(state.buyers)
);
localStorage.setItem(
  STORAGE_KEYS.harvest,
  JSON.stringify(state.harvest)
);

    if (state.auth.user) {
      localStorage.setItem(
        STORAGE_KEYS.session,
        JSON.stringify(state.auth.user)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.session);
    }
  } catch (error) {
    console.error("Could not save application state:", error);
  }
});