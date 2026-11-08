export const EQUIPMENT_TYPES = [
  "Tractor",
  "Water Pump",
  "Sprayer",
  "Harvester",
  "Other",
];

export const EQUIPMENT_STATUSES = [
  "Active",
  "Under Repair",
  "Idle",
];

// Validate YYYY-MM-DD dates
function isValidDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

// Get today's date in local YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Calculate next service date
export function calculateNextServiceDate(
  lastServiceDate,
  serviceIntervalDays
) {
  if (!isValidDate(lastServiceDate)) {
    return null;
  }

  const interval = Number(serviceIntervalDays);

  if (!Number.isInteger(interval) || interval <= 0) {
    return null;
  }

  const [year, month, day] = lastServiceDate
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day + interval)
  );

  const nextYear = date.getUTCFullYear();
  const nextMonth = String(
    date.getUTCMonth() + 1
  ).padStart(2, "0");

  const nextDay = String(
    date.getUTCDate()
  ).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

// Determine service condition
export function getServiceStatus(nextServiceDate) {
  if (!isValidDate(nextServiceDate)) {
    return "Not Scheduled";
  }

  const today = getTodayDate();

  if (nextServiceDate < today) {
    return "Overdue";
  }

  const [year, month, day] = nextServiceDate
    .split("-")
    .map(Number);

  const [todayYear, todayMonth, todayDay] = today
    .split("-")
    .map(Number);

  const serviceTime = Date.UTC(
    year,
    month - 1,
    day
  );

  const todayTime = Date.UTC(
    todayYear,
    todayMonth - 1,
    todayDay
  );

  const difference = Math.round(
    (serviceTime - todayTime) / (1000 * 60 * 60 * 24)
  );

  if (difference <= 7) {
    return "Due in 7 days";
  }

  return "OK";
}

// Validate equipment form
export function validateEquipment(
  equipment,
  allEquipment = [],
  excludeId = null
) {
  const errors = {};

  // Validate name
  const name = String(equipment.name || "").trim();

  if (!name) {
    errors.name = "Equipment name is required.";
  } else if (name.length < 2) {
    errors.name = "Equipment name must contain at least 2 characters.";
  }

  // Validate equipment type
  if (!EQUIPMENT_TYPES.includes(equipment.type)) {
    errors.type = "Select a valid equipment type.";
  }

  // Validate equipment status
  if (!EQUIPMENT_STATUSES.includes(equipment.status)) {
    errors.status = "Select a valid equipment status.";
  }

  // Validate purchase date
  if (!isValidDate(equipment.purchaseDate)) {
    errors.purchaseDate = "Enter a valid purchase date.";
  }

  // Validate optional last service date
  if (
    equipment.lastServiceDate &&
    !isValidDate(equipment.lastServiceDate)
  ) {
    errors.lastServiceDate = "Enter a valid last service date.";
  }

  // Last service date cannot be before purchase date
  if (
    isValidDate(equipment.purchaseDate) &&
    isValidDate(equipment.lastServiceDate) &&
    equipment.lastServiceDate < equipment.purchaseDate
  ) {
    errors.lastServiceDate =
      "Last service date cannot be before purchase date.";
  }

  // Validate service interval
  const interval = Number(equipment.serviceIntervalDays);

  if (
    equipment.serviceIntervalDays === "" ||
    !Number.isInteger(interval) ||
    interval <= 0
  ) {
    errors.serviceIntervalDays =
      "Service interval must be a positive whole number.";
  }

  // Prevent duplicate equipment names
  const duplicate = allEquipment.some(
    (item) =>
      String(item.name || "").trim().toLowerCase() ===
        name.toLowerCase() &&
      String(item.id) !== String(excludeId)
  );

  if (name && duplicate) {
    errors.name =
      "Equipment with this name already exists.";
  }

  return errors;
}