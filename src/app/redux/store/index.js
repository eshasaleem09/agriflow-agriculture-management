import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../reducers/index.js";
import { storageApi } from "../api/index.js";
import { persistMiddleware } from "../middleware/persistMiddleware.js";
import { activityLogger } from "../middleware/activityLogger.js";

const MISSING = "__AGRI_DATA_NOT_FOUND__";

const STORAGE_MAP = [
  ["crops", "agri_crops", "agriflow-crops"],
  ["buyers", "agri_buyers", "agriflow-buyers"],
  ["tasks", "agri_tasks", "agriflow-tasks"],
  ["expenses", "agri_expenses", "agriflow-expenses"],
  ["inventory", "agri_inventory", "agriflow-inventory"],
  ["activity", "agri_activity", "agriflow-activity"],
  ["workers", "agri_workers", null],
  ["attendance", "agri_attendance", null],
  ["equipment", "agri_equipment", null],
  ["maintenance", "agri_maintenance", null],
];

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(activityLogger, persistMiddleware),
});

async function readAndMigrate(newKey, oldKey = null) {
  let response = await storageApi.getItem(newKey, MISSING);

  if (!response.data.succeeded) {
    console.error(response.data.message);
    return undefined;
  }

  if (response.data.data !== MISSING) {
    return response.data.data;
  }

  if (oldKey) {
    response = await storageApi.getItem(oldKey, MISSING);

    if (!response.data.succeeded) {
      console.error(response.data.message);
      return undefined;
    }

    if (response.data.data !== MISSING) {
      await storageApi.setItem(newKey, response.data.data);
      return response.data.data;
    }
  }

  return undefined;
}

export async function hydrateStore() {
  const savedState = {};

  for (const [stateKey, newKey, oldKey] of STORAGE_MAP) {
    const data = await readAndMigrate(newKey, oldKey);

    if (data !== undefined) {
      savedState[stateKey] = data;
    }
  }

  const harvest = await readAndMigrate(
    "agri_harvest",
    "agriflow-harvest"
  );

  const orders = await readAndMigrate(
  "agri_orders",
  "agriflow-orders"
);

  if (harvest !== undefined) {
    savedState.harvest = {
      ...harvest,
      orders: orders !== undefined ? orders : harvest.orders,
    };
  } else if (orders !== undefined) {
    savedState.harvest = { orders };
  }

  const session = await readAndMigrate(
    "agri_session",
    "agriflow-session"
  );

  if (session !== undefined) {
    savedState.auth = {
      user: session,
      isAuthenticated: Boolean(session),
    };
  }

  store.dispatch({
    type: "app/HYDRATE_STATE",
    payload: savedState,
  });

  console.log("AgriFlow Redux Store hydrated successfully.");
}
