import { addActivity } from "../features/activity/activitySlice.js";

const trackedActions = {
  "crops/addCrop": {
    entity: "Crop",
    stateKey: "crops",
    verb: "Added",
  },
  "crops/updateCrop": {
    entity: "Crop",
    stateKey: "crops",
    verb: "Updated",
  },
  "crops/deleteCrop": {
    entity: "Crop",
    stateKey: "crops",
    verb: "Deleted",
  },

  "tasks/addTask": {
    entity: "Farm task",
    stateKey: "tasks",
    verb: "Added",
  },
  "tasks/updateTask": {
    entity: "Farm task",
    stateKey: "tasks",
    verb: "Updated",
  },
  "tasks/deleteTask": {
    entity: "Farm task",
    stateKey: "tasks",
    verb: "Deleted",
  },
  "tasks/markTaskDone": {
    entity: "Farm task",
    stateKey: "tasks",
    verb: "Completed",
  },

  "inventory/addInventoryItem": {
    entity: "Inventory item",
    stateKey: "inventory",
    verb: "Added",
  },
  "inventory/updateInventoryItem": {
    entity: "Inventory item",
    stateKey: "inventory",
    verb: "Updated",
  },
  "inventory/deleteInventoryItem": {
    entity: "Inventory item",
    stateKey: "inventory",
    verb: "Deleted",
  },
  "inventory/recordInventoryUsage": {
    entity: "Inventory item",
    stateKey: "inventory",
    verb: "Recorded usage",
  },

  "expenses/addExpense": {
    entity: "Financial record",
    stateKey: "expenses",
    verb: "Added",
  },
  "expenses/updateExpense": {
    entity: "Financial record",
    stateKey: "expenses",
    verb: "Updated",
  },
  "expenses/deleteExpense": {
    entity: "Financial record",
    stateKey: "expenses",
    verb: "Deleted",
  },
  "buyers/addBuyer": {
  entity: "Buyer",
  stateKey: "buyers",
  verb: "Added",
},

"buyers/updateBuyer": {
  entity: "Buyer",
  stateKey: "buyers",
  verb: "Updated",
},

"buyers/deleteBuyer": {
  entity: "Buyer",
  stateKey: "buyers",
  verb: "Deleted",
},
};

export const activityLogger = (storeAPI) => (next) => (action) => {
  const config = trackedActions[action.type];

  // Let Redux process the original action first.
  const previousState = storeAPI.getState();
  const result = next(action);

  if (!config) {
    return result;
  }

  const currentState = storeAPI.getState();
  const payload = action.payload;

  const payloadObject =
    payload && typeof payload === "object" ? payload : null;

  const entityId =
    payloadObject?.id !== undefined ? payloadObject.id : payload;

  const previousItems = previousState[config.stateKey] || [];
  const currentItems = currentState[config.stateKey] || [];

  const previousEntity = previousItems.find(
    (item) => String(item.id) === String(entityId)
  );

  const currentEntity = currentItems.find(
    (item) => String(item.id) === String(entityId)
  );

  const entityName =
    payloadObject?.name ||
    payloadObject?.title ||
    payloadObject?.category ||
    currentEntity?.name ||
    currentEntity?.title ||
    currentEntity?.category ||
    previousEntity?.name ||
    previousEntity?.title ||
    previousEntity?.category ||
    String(entityId ?? config.entity);

  let details = `${config.verb} ${config.entity.toLowerCase()}: "${entityName}"`;

  if (action.type === "inventory/recordInventoryUsage") {
    const unit = currentEntity?.unit || previousEntity?.unit || "";

    details = `Recorded usage of ${payload.amount} ${unit} from "${entityName}"`;

    if (payload.note) {
      details += ` — ${payload.note}`;
    }
  }

  const user = currentState.auth?.user;

  storeAPI.dispatch(
    addActivity({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user: user?.name || user?.username || "Unknown user",
      role: user?.role || "Unknown role",
      action: config.verb,
      entity: config.entity,
      details,
      timestamp: new Date().toISOString(),
    })
  );

  return result;
};