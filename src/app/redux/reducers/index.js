
import { combineReducers } from "@reduxjs/toolkit";

import cropsReducer from "../../../features/crops/cropsSlice.js";
import authReducer from "../../../features/auth/authSlice.js";
import weatherReducer from "../../../features/weather/weatherSlice.js";
import tasksReducer from "../../../features/tasks/tasksSlice.js";
import inventoryReducer from "../../../features/inventory/inventorySlice.js";
import expensesReducer from "../../../features/expenses/expensesSlice.js";
import activityReducer from "../../../features/activity/activitySlice.js";
import buyersReducer from "../../../features/buyers/buyersSlice.js";
import harvestReducer from "../../../features/harvest/harvestSlice.js";
import equipmentReducer from "../../../features/equipment/equipmentSlice.js";
import maintenanceReducer from "../../../features/maintenance/maintenanceSlice.js";

// New v2 modules
import workersReducer from "../../../features/workers/workersSlice.js";
import attendanceReducer from "../../../features/attendance/attendanceSlice.js";

const combinedReducer = combineReducers({
  crops: cropsReducer,
  auth: authReducer,
  weather: weatherReducer,
  tasks: tasksReducer,
  inventory: inventoryReducer,
  expenses: expensesReducer,
  activity: activityReducer,
  buyers: buyersReducer,
  harvest: harvestReducer,
  equipment: equipmentReducer,
maintenance: maintenanceReducer,


  // New modules
  workers: workersReducer,
  attendance: attendanceReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "app/HYDRATE_STATE") {
    return combinedReducer(
      {
        ...state,
        ...action.payload,
      },
      { type: "@@redux/INIT" }
    );
  }

  return combinedReducer(state, action);
};

export default rootReducer;
