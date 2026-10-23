import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  recordInventoryUsage,
} from "../features/inventory/inventorySlice.js";

import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Pencil,
  Trash2,
  X,
  History,
  ArrowDownToLine,
} from "lucide-react";

const CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Pesticide",
  "Tools",
  "Fuel",
  "Other",
];

const UNITS = ["kg", "bags", "litres", "units", "bottles", "packets"];

function Inventory() {
  const dispatch = useDispatch();

  const inventory = useSelector((state) => state.inventory);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === "Admin";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [error, setError] = useState("");

  const emptyForm = {
    name: "",
    category: "Seeds",
    quantity: "",
    unit: "kg",
    minStock: "",
  };

  const [form, setForm] = useState(emptyForm);

  const [usageForm, setUsageForm] = useState({
    amount: "",
    note: "",
  });

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minStock
  );

  const outOfStockItems = inventory.filter(
    (item) => item.quantity === 0
  );

  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const filteredItems = useMemo(() => {
    return inventory
      .filter((item) => {
        const term = search.trim().toLowerCase();

        const matchesSearch =
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term);

        const matchesCategory =
          categoryFilter === "All" ||
          item.category === categoryFilter;

        const isLow = item.quantity <= item.minStock;

        const matchesStock =
          stockFilter === "All" ||
          (stockFilter === "Low Stock" && isLow) ||
          (stockFilter === "In Stock" && !isLow);

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, search, categoryFilter, stockFilter]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  }

  function openEditForm(item) {
    if (!isAdmin) return;

    setEditingId(item.id);

    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      minStock: String(item.minStock),
    });

    setError("");
    setFormOpen(true);
  }

  function handleSaveItem(event) {
    event.preventDefault();

    if (editingId !== null && !isAdmin) {
      setError("Only an Admin can edit inventory records.");
      return;
    }

    const name = form.name.trim();
    const quantity = Number(form.quantity);
    const minStock = Number(form.minStock);

    if (!name || form.quantity === "" || form.minStock === "") {
      setError("Please complete all required fields.");
      return;
    }

    if (
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      !Number.isFinite(minStock) ||
      minStock < 0
    ) {
      setError("Stock quantities cannot be negative.");
      return;
    }

    const duplicate = inventory.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingId
    );

    if (duplicate) {
      setError("An inventory item with this name already exists.");
      return;
    }

    const existingItem = inventory.find(
      (item) => item.id === editingId
    );

    const itemData = {
      id: editingId ?? Date.now(),
      name,
      category: form.category,
      quantity,
      unit: form.unit,
      minStock,
      usageHistory: existingItem?.usageHistory ?? [],
    };

    if (editingId !== null) {
      dispatch(updateInventoryItem(itemData));
    } else {
      dispatch(addInventoryItem(itemData));
    }

    setFormOpen(false);
    setForm(emptyForm);
    setError("");
  }

  function handleDeleteItem(item) {
    if (!isAdmin) return;

    if (window.confirm(`Delete ${item.name} from inventory?`)) {
      dispatch(deleteInventoryItem(item.id));
    }
  }

  function openUsageForm(item) {
    setSelectedItemId(item.id);
    setUsageForm({ amount: "", note: "" });
    setError("");
    setUsageOpen(true);
  }

  function handleRecordUsage(event) {
    event.preventDefault();

    const item = inventory.find(
      (entry) => entry.id === selectedItemId
    );

    if (!item) {
      setError("Inventory item not found.");
      return;
    }

    const amount = Number(usageForm.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > item.quantity
    ) {
      setError(
        `Enter a quantity greater than zero and no more than ${item.quantity} ${item.unit}.`
      );
      return;
    }

    dispatch(
      recordInventoryUsage({
        id: item.id,
        amount,
        note: usageForm.note.trim(),
        usedBy: user?.name || user?.username || "Farm user",
        usedAt: new Date().toISOString(),
      })
    );

    setUsageOpen(false);
    setError("");
  }

  return (
    <section className="inventory-page">
      <div className="inventory-heading">
        <div>
          <span className="inventory-eyebrow">FARM RESOURCES</span>
          <h2>Inventory Management</h2>
          <p>
            Manage farm supplies, monitor stock levels and record usage.
          </p>
        </div>

        <button
          type="button"
          className="inventory-primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="inventory-alert" role="status">
          <AlertTriangle size={22} />

          <div>
            <strong>
              {lowStockItems.length} item
              {lowStockItems.length === 1 ? "" : "s"} need attention
            </strong>

            <p>
              {lowStockItems
                .map((item) => item.name)
                .join(", ")}
              {" "}have reached their minimum stock level.
            </p>
          </div>
        </div>
      )}

      <div className="inventory-summary-grid">
        <article className="inventory-summary-card">
          <Boxes size={23} />
          <p>Inventory Items</p>
          <h3>{inventory.length}</h3>
        </article>

        <article className="inventory-summary-card">
          <Package size={23} />
          <p>Total Stock Units</p>
          <h3>{totalUnits.toLocaleString()}</h3>
        </article>

        <article className="inventory-summary-card">
          <AlertTriangle size={23} />
          <p>Low Stock</p>
          <h3>{lowStockItems.length}</h3>
        </article>

        <article className="inventory-summary-card">
          <CheckCircle2 size={23} />
          <p>Out of Stock</p>
          <h3>{outOfStockItems.length}</h3>
        </article>
      </div>

      <div className="inventory-toolbar">
        <label className="inventory-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search inventory..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All categories</option>

          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
          aria-label="Filter by stock level"
        >
          <option value="All">All stock levels</option>
          <option value="Low Stock">Low stock</option>
          <option value="In Stock">In stock</option>
        </select>
      </div>

      <div className="inventory-list-heading">
        <h3>Farm Supplies</h3>
        <span>{filteredItems.length} items</span>
      </div>

      {filteredItems.length > 0 ? (
        <div className="inventory-grid">
          {filteredItems.map((item) => {
            const isLow = item.quantity <= item.minStock;
            const isOut = item.quantity === 0;

            return (
              <article className="inventory-card" key={item.id}>
                <div className="inventory-card-top">
                  <span className="inventory-item-icon">
                    <Package size={24} />
                  </span>

                  <span
                    className={`inventory-stock-badge ${
                      isOut
                        ? "inventory-status-out"
                        : isLow
                          ? "inventory-status-low"
                          : "inventory-status-good"
                    }`}
                  >
                    {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                  </span>
                </div>

                <p className="inventory-category">{item.category}</p>
                <h3>{item.name}</h3>

                <div className="inventory-quantity">
                  <span>Available quantity</span>
                  <strong>
                    {item.quantity.toLocaleString()} {item.unit}
                  </strong>
                </div>

                <div className="inventory-minimum">
                  Minimum stock: {item.minStock} {item.unit}
                </div>

                <div className="inventory-usage-heading">
                  <History size={16} />
                  Recent usage
                </div>

                {item.usageHistory?.length > 0 ? (
                  <div className="inventory-usage-history">
                    {item.usageHistory.slice(0, 2).map((usage) => (
                      <p key={usage.id}>
                        −{usage.amount} {item.unit}
                        {usage.note ? ` · ${usage.note}` : ""}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="inventory-no-usage">
                    No usage recorded yet.
                  </p>
                )}

                <div className="inventory-card-actions">
                  <button
                    type="button"
                    className="inventory-use-button"
                    onClick={() => openUsageForm(item)}
                  >
                    <ArrowDownToLine size={16} />
                    Record Usage
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        className="inventory-edit-button"
                        onClick={() => openEditForm(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="inventory-delete-button"
                        onClick={() => handleDeleteItem(item)}
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="inventory-empty">
          <Package size={36} />
          <h3>No inventory items found</h3>
          <p>Try a different search term or filter.</p>
        </div>
      )}

      {formOpen && (
        <div
          className="inventory-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setFormOpen(false);
            }
          }}
        >
          <section
            className="inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-modal-title"
          >
            <div className="inventory-modal-heading">
              <div>
                <span className="inventory-eyebrow">STOCK RECORD</span>

                <h3 id="inventory-modal-title">
                  {editingId !== null ? "Edit Item" : "Add Inventory Item"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close inventory form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              <label>
                Item name
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Rice Seeds"
                  required
                />
              </label>

              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Available quantity
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({ ...form, quantity: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Unit
                <select
                  value={form.unit}
                  onChange={(event) =>
                    setForm({ ...form, unit: event.target.value })
                  }
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Minimum stock alert level
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.minStock}
                  onChange={(event) =>
                    setForm({ ...form, minStock: event.target.value })
                  }
                  required
                />
              </label>

              {error && (
                <p className="inventory-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="inventory-cancel-button"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-primary-button"
                >
                  {editingId !== null ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {usageOpen && (
        <div
          className="inventory-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setUsageOpen(false);
            }
          }}
        >
          <section
            className="inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usage-modal-title"
          >
            <div className="inventory-modal-heading">
              <div>
                <span className="inventory-eyebrow">STOCK MOVEMENT</span>
                <h3 id="usage-modal-title">Record Inventory Usage</h3>
              </div>

              <button
                type="button"
                onClick={() => setUsageOpen(false)}
                aria-label="Close usage form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordUsage}>
              <label>
                Quantity used
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={usageForm.amount}
                  onChange={(event) =>
                    setUsageForm({
                      ...usageForm,
                      amount: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Purpose or notes
                <textarea
                  rows="3"
                  value={usageForm.note}
                  onChange={(event) =>
                    setUsageForm({
                      ...usageForm,
                      note: event.target.value,
                    })
                  }
                  placeholder="e.g. Applied to Field A"
                />
              </label>

              {error && (
                <p className="inventory-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="inventory-cancel-button"
                  onClick={() => setUsageOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-primary-button"
                >
                  Save Usage
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default Inventory;