import { storageApi } from "../api/index.js";

const STORAGE_CONFIG = [
  { stateKey: "crops", storageKey: "agri_crops" },
  { stateKey: "buyers", storageKey: "agri_buyers" },
  { stateKey: "tasks", storageKey: "agri_tasks" },
  { stateKey: "expenses", storageKey: "agri_expenses" },
  { stateKey: "inventory", storageKey: "agri_inventory" },
  { stateKey: "activity", storageKey: "agri_activity" },
  { stateKey: "workers", storageKey: "agri_workers" },
  { stateKey: "attendance", storageKey: "agri_attendance" },
  { stateKey: "equipment", storageKey: "agri_equipment" },
  { stateKey: "maintenance", storageKey: "agri_maintenance" },
];

export const persistMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);
  if (action.type === "app/HYDRATE_STATE") {
  return result;
}

  const state = storeAPI.getState();

  const savePromises = STORAGE_CONFIG.map(
    async ({ stateKey, storageKey }) => {
      if (state[stateKey] !== undefined) {
        const response = await storageApi.setItem(
          storageKey,
          state[stateKey]
        );

        if (!response.data.succeeded) {
          console.error(response.data.message);
        }
      }
    }
  );

  // Preserve existing harvest and orders structure
  if (state.harvest !== undefined) {
    savePromises.push(
      storageApi.setItem("agri_harvest", state.harvest),
      storageApi.setItem("agri_orders", state.harvest.orders)
    );
  }

  // Save authentication session
if (state.auth?.user) {
  savePromises.push(
    storageApi.setItem("agri_session", state.auth.user),
    storageApi.removeItem("agriflow-session")
  );
} else {
  savePromises.push(
    storageApi.removeItem("agri_session"),
    storageApi.removeItem("agriflow-session")
  );
}

  Promise.all(savePromises).catch((error) => {
    console.error("Persistence error:", error);
  });

  return result;
};