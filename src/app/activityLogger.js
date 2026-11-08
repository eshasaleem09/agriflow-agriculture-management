import { addActivity } from "../features/activity/activitySlice.js";

const trackedActions = {
  // CROPS
  "crops/addCrop": {
    entity: "Crop",
    statePath: "crops",
    verb: "Added",
  },
  "crops/updateCrop": {
    entity: "Crop",
    statePath: "crops",
    verb: "Updated",
  },
  "crops/deleteCrop": {
    entity: "Crop",
    statePath: "crops",
    verb: "Deleted",
  },

  // TASKS
  "tasks/addTask": {
    entity: "Farm task",
    statePath: "tasks",
    verb: "Added",
  },
  "tasks/updateTask": {
    entity: "Farm task",
    statePath: "tasks",
    verb: "Updated",
  },
  "tasks/deleteTask": {
    entity: "Farm task",
    statePath: "tasks",
    verb: "Deleted",
  },
  "tasks/markTaskDone": {
    entity: "Farm task",
    statePath: "tasks",
    verb: "Completed",
  },

  // INVENTORY
  "inventory/addInventoryItem": {
    entity: "Inventory item",
    statePath: "inventory",
    verb: "Added",
  },
  "inventory/updateInventoryItem": {
    entity: "Inventory item",
    statePath: "inventory",
    verb: "Updated",
  },
  "inventory/deleteInventoryItem": {
    entity: "Inventory item",
    statePath: "inventory",
    verb: "Deleted",
  },
  "inventory/recordInventoryUsage": {
    entity: "Inventory item",
    statePath: "inventory",
    verb: "Recorded usage",
  },

  // EXPENSES
  "expenses/addExpense": {
    entity: "Financial record",
    statePath: "expenses",
    verb: "Added",
  },
  "expenses/updateExpense": {
    entity: "Financial record",
    statePath: "expenses",
    verb: "Updated",
  },
  "expenses/deleteExpense": {
    entity: "Financial record",
    statePath: "expenses",
    verb: "Deleted",
  },

  // BUYERS
  "buyers/addBuyer": {
    entity: "Buyer",
    statePath: "buyers",
    verb: "Added",
  },
  "buyers/updateBuyer": {
    entity: "Buyer",
    statePath: "buyers",
    verb: "Updated",
  },
  "buyers/deleteBuyer": {
    entity: "Buyer",
    statePath: "buyers",
    verb: "Deleted",
  },

  // WORKERS
  "workers/addWorker": {
    entity: "Worker",
    statePath: "workers",
    verb: "Added",
  },
  "workers/updateWorker": {
    entity: "Worker",
    statePath: "workers",
    verb: "Updated",
  },
  "workers/deleteWorker": {
    entity: "Worker",
    statePath: "workers",
    verb: "Deleted",
  },
  "workers/updateWorkerStatus": {
    entity: "Worker",
    statePath: "workers",
    verb: "Updated status of",
  },

  // ATTENDANCE
  "attendance/addAttendance": {
    entity: "Attendance record",
    statePath: "attendance",
    verb: "Added",
  },
  "attendance/updateAttendance": {
    entity: "Attendance record",
    statePath: "attendance",
    verb: "Updated",
  },
  "attendance/deleteAttendance": {
    entity: "Attendance record",
    statePath: "attendance",
    verb: "Deleted",
  },

  // EQUIPMENT
  "equipment/addEquipment": {
    entity: "Equipment",
    statePath: "equipment",
    verb: "Added",
  },
  "equipment/updateEquipment": {
    entity: "Equipment",
    statePath: "equipment",
    verb: "Updated",
  },
  "equipment/deleteEquipment": {
    entity: "Equipment",
    statePath: "equipment",
    verb: "Deleted",
  },
  "equipment/updateEquipmentStatus": {
    entity: "Equipment",
    statePath: "equipment",
    verb: "Updated status of",
  },

  // MAINTENANCE
  "maintenance/addMaintenance": {
    entity: "Maintenance record",
    statePath: "maintenance",
    verb: "Added",
  },
  "maintenance/updateMaintenance": {
    entity: "Maintenance record",
    statePath: "maintenance",
    verb: "Updated",
  },
  "maintenance/deleteMaintenance": {
    entity: "Maintenance record",
    statePath: "maintenance",
    verb: "Deleted",
  },

  // HARVEST SCHEDULE
  "harvest/addHarvest": {
    entity: "Harvest schedule",
    statePath: "harvest.schedule",
    verb: "Added",
  },
  "harvest/updateHarvest": {
    entity: "Harvest schedule",
    statePath: "harvest.schedule",
    verb: "Updated",
  },
  "harvest/deleteHarvest": {
    entity: "Harvest schedule",
    statePath: "harvest.schedule",
    verb: "Deleted",
  },
  "harvest/completeHarvest": {
    entity: "Harvest schedule",
    statePath: "harvest.schedule",
    verb: "Completed",
  },

  // ORDERS
  "harvest/addOrder": {
    entity: "Customer order",
    statePath: "harvest.orders",
    verb: "Added",
  },
  "harvest/updateOrder": {
    entity: "Customer order",
    statePath: "harvest.orders",
    verb: "Updated",
  },
  "harvest/deleteOrder": {
    entity: "Customer order",
    statePath: "harvest.orders",
    verb: "Deleted",
  },
};
const getItems = (state, statePath) => {
  return statePath
    .split(".")
    .reduce((current, key) => current?.[key], state) || [];
};

export const activityLogger = (storeAPI) => (next) => (action) => {
  const config = trackedActions[action.type];

  const previousState = storeAPI.getState();

  // Process the original Redux action first.
  const result = next(action);

  if (!config) {
    return result;
  }

  const currentState = storeAPI.getState();
  const payload = action.payload;

  const payloadObject =
    payload && typeof payload === "object" ? payload : null;

  const entityId =
    payloadObject?.id !== undefined
      ? payloadObject.id
      : payload;

  const previousItems = getItems(previousState, config.statePath);
  const currentItems = getItems(currentState, config.statePath);

  const previousEntity = previousItems.find(
    (item) => String(item.id) === String(entityId)
  );

  const currentEntity = currentItems.find(
    (item) => String(item.id) === String(entityId)
  );

  const entityName =
    payloadObject?.name ||
    payloadObject?.title ||
    payloadObject?.customer ||
    currentEntity?.name ||
    currentEntity?.title ||
    currentEntity?.customer ||
    previousEntity?.name ||
    previousEntity?.title ||
    previousEntity?.customer ||
    String(entityId ?? config.entity);

  let details = `${config.verb} ${config.entity.toLowerCase()}: "${entityName}"`;

  // Inventory usage details
  if (action.type === "inventory/recordInventoryUsage") {
    const unit = currentEntity?.unit || previousEntity?.unit || "";

    details = `Recorded usage of ${payload.amount} ${unit} from "${entityName}"`;

    if (payload.note) {
      details += ` — ${payload.note}`;
    }
  }

  // Attendance details
  if (action.type === "attendance/addAttendance") {
    details = `Added attendance record for worker ID: ${payload.workerId}`;
  }

  // Current logged-in user
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