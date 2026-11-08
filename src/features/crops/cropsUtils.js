export function getHealthStatus(health) {
  const score = Number(health);

  if (score >= 70) return "Healthy";
  if (score >= 40) return "Needs Attention";

  return "Critical";
}

export function getHealthClass(health) {
  const score = Number(health);

  if (score >= 70) return "healthy";
  if (score >= 40) return "attention";

  return "critical";
}

export function validateCrop(crop, crops = [], excludeId = null) {
  const errors = {};

  const name = (crop.name || "").trim();
  const field = (crop.field || "").trim();

  if (!name) {
    errors.name = "Crop name is required.";
  }

  if (!field) {
    errors.field = "Field name is required.";
  }

  const quantity = Number(crop.quantity);

  if (
    crop.quantity === "" ||
    !Number.isFinite(quantity) ||
    quantity < 0
  ) {
    errors.quantity = "Quantity must be zero or greater.";
  }

  const health = Number(crop.health);

  if (
    crop.health === "" ||
    !Number.isInteger(health) ||
    health < 0 ||
    health > 100
  ) {
    errors.health = "Health score must be a whole number between 0 and 100.";
  }

  const duplicate = crops.some(
    (item) =>
      (item.name || "").trim().toLowerCase() === name.toLowerCase() &&
      String(item.id) !== String(excludeId)
  );

  if (name && duplicate) {
    errors.name = "A crop with this name already exists.";
  }

  return errors;
}