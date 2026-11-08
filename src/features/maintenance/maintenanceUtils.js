function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateMaintenance(record, equipment = []) {
  const errors = {};

  if (!record.equipmentId) {
    errors.equipmentId = "Please select equipment.";
  } else if (
    equipment.length > 0 &&
    !equipment.some(
      (item) => String(item.id) === String(record.equipmentId)
    )
  ) {
    errors.equipmentId = "Selected equipment does not exist.";
  }

  if (!isValidDate(record.date)) {
    errors.date = "Please select a valid maintenance date.";
  }

  if (!record.description?.trim()) {
    errors.description = "Description is required.";
  }

  if (!record.performedBy?.trim()) {
    errors.performedBy = "Performed by is required.";
  }

  const cost = Number(record.cost);

  if (!Number.isFinite(cost) || cost <= 0) {
    errors.cost = "Maintenance cost must be greater than zero.";
  }

  return errors;
}

export function getLatestServiceDate(
  equipmentId,
  maintenanceRecords,
  fallbackDate = ""
) {
  const records = maintenanceRecords
    .filter(
      (record) =>
        String(record.equipmentId) === String(equipmentId) &&
        isValidDate(record.date)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return records[0]?.date || (isValidDate(fallbackDate) ? fallbackDate : "");
}