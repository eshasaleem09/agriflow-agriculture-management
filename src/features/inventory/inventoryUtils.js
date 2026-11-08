export const INVENTORY_CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Pesticide",
  "Tools",
  "Fuel",
  "Other",
];

export const INVENTORY_UNITS = [
  "kg",
  "bags",
  "litres",
  "units",
  "bottles",
  "packets",
];

export function validateInventoryItem(
  item,
  inventory = [],
  excludeId = null
) {
  const errors = {};

  const name = (item.name || "").trim();

  if (!name) {
    errors.name = "Item name is required.";
  }

  if (!INVENTORY_CATEGORIES.includes(item.category)) {
    errors.category = "Please select a valid category.";
  }

  if (!INVENTORY_UNITS.includes(item.unit)) {
    errors.unit = "Please select a valid unit.";
  }

  const quantity = Number(item.quantity);
  const minStock = Number(item.minStock);

  if (item.quantity === "" || !Number.isFinite(quantity) || quantity < 0) {
    errors.quantity = "Quantity cannot be negative.";
  }

  if (item.minStock === "" || !Number.isFinite(minStock) || minStock < 0) {
    errors.minStock = "Minimum stock cannot be negative.";
  }

  const duplicate = inventory.some(
    (entry) =>
      (entry.name || "").trim().toLowerCase() === name.toLowerCase() &&
      String(entry.id) !== String(excludeId)
  );

  if (name && duplicate) {
    errors.name = "An inventory item with this name already exists.";
  }

  return errors;
}

export function validateInventoryUsage(amount, availableQuantity) {
  const quantity = Number(amount);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return "Usage quantity must be greater than zero.";
  }

  if (quantity > Number(availableQuantity)) {
    return `Available stock is only ${availableQuantity}.`;
  }

  return "";
}