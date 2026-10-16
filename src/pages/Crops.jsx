import { useEffect, useMemo, useState } from "react";
import {
Sprout,
Plus,
Search,
Pencil,
Trash2,
X,
Leaf,
Activity,
AlertTriangle,
CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "agriflow-crops";

const initialCrops = [
{ id: 1, name: "Wheat", quantity: 2500, health: 88, field: "Field A" },
{ id: 2, name: "Rice", quantity: 3200, health: 72, field: "Field B" },
{ id: 3, name: "Corn", quantity: 1800, health: 48, field: "Field C" },
{ id: 4, name: "Cotton", quantity: 950, health: 25, field: "Field D" },
];

function getHealthStatus(health) {
if (health >= 70) return "Healthy";
if (health >= 40) return "Needs Attention";
return "Critical";
}

function getHealthClass(health) {
if (health >= 70) return "healthy";
if (health >= 40) return "attention";
return "critical";
}

function readCrops() {
try {
const saved = localStorage.getItem(STORAGE_KEY);
return saved ? JSON.parse(saved) : initialCrops;
} catch {
return initialCrops;
}
}

function Crops() {
const [crops, setCrops] = useState(readCrops);
const [search, setSearch] = useState("");
const [healthFilter, setHealthFilter] = useState("All");
const [sortBy, setSortBy] = useState("name");
const [modalOpen, setModalOpen] = useState(false);
const [editingId, setEditingId] = useState(null);
const [formError, setFormError] = useState("");
const [form, setForm] = useState({
name: "",
quantity: "",
health: "80",
field: "",
});

useEffect(() => {
localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
}, [crops]);

const filteredCrops = useMemo(() => {
const result = crops.filter((crop) => {
const matchesSearch =
crop.name.toLowerCase().includes(search.toLowerCase()) ||
crop.field.toLowerCase().includes(search.toLowerCase());

  const matchesHealth =
    healthFilter === "All" ||
    getHealthStatus(crop.health) === healthFilter;

  return matchesSearch && matchesHealth;
});

return result.sort((a, b) => {
  if (sortBy === "quantity") return b.quantity - a.quantity;
  if (sortBy === "health") return b.health - a.health;
  return a.name.localeCompare(b.name);
});

}, [crops, search, healthFilter, sortBy]);

const healthyCount = crops.filter((crop) => crop.health >= 70).length;
const attentionCount = crops.filter(
(crop) => crop.health >= 40 && crop.health < 70
).length;
const criticalCount = crops.filter((crop) => crop.health < 40).length;

function openAddModal() {
setEditingId(null);
setForm({ name: "", quantity: "", health: "80", field: "" });
setFormError("");
setModalOpen(true);
}

function openEditModal(crop) {
setEditingId(crop.id);
setForm({
name: crop.name,
quantity: String(crop.quantity),
health: String(crop.health),
field: crop.field,
});
setFormError("");
setModalOpen(true);
}

function handleSubmit(event) {
event.preventDefault();

const name = form.name.trim();
const field = form.field.trim();
const quantity = Number(form.quantity);
const health = Number(form.health);

if (!name || !field || form.quantity === "") {
  setFormError("Please fill in all fields.");
  return;
}

if (!Number.isFinite(quantity) || quantity < 0) {
  setFormError("Quantity must be zero or greater.");
  return;
}

if (!Number.isInteger(health) || health < 0 || health > 100) {
  setFormError("Health score must be between 0 and 100.");
  return;
}

const duplicate = crops.some(
  (crop) =>
    crop.name.toLowerCase() === name.toLowerCase() &&
    crop.id !== editingId
);

if (duplicate) {
  setFormError("A crop with this name already exists.");
  return;
}

const cropData = { name, quantity, health, field };

if (editingId !== null) {
  setCrops((current) =>
    current.map((crop) =>
      crop.id === editingId ? { ...crop, ...cropData } : crop
    )
  );
} else {
  setCrops((current) => [
    ...current,
    { id: Date.now(), ...cropData },
  ]);
}

setModalOpen(false);
setFormError("");

}

function deleteCrop(id) {
const crop = crops.find((item) => item.id === id);
if (!crop) return;

if (window.confirm(`Delete ${crop.name} from crop records?`)) {
  setCrops((current) => current.filter((item) => item.id !== id));
}

}

return ( <section className="crops-page"> <div className="crops-heading"> <div> <span className="crops-eyebrow">FARM OPERATIONS</span> <h2>Crop Management</h2> <p>Monitor crop health, manage inventory, and maintain farm records.</p> </div>

    <button className="crops-primary-button" onClick={openAddModal}>
      <Plus size={18} />
      Add Crop
    </button>
  </div>

  <div className="crops-summary-grid">
    <article className="panel crops-summary-card">
      <span className="crops-summary-icon"><Sprout size={22} /></span>
      <div>
        <p>Total Crops</p>
        <h3>{crops.length}</h3>
      </div>
    </article>

    <article className="panel crops-summary-card">
      <span className="crops-summary-icon summary-healthy"><CheckCircle2 size={22} /></span>
      <div>
        <p>Healthy</p>
        <h3>{healthyCount}</h3>
      </div>
    </article>

    <article className="panel crops-summary-card">
      <span className="crops-summary-icon summary-attention"><Activity size={22} /></span>
      <div>
        <p>Needs Attention</p>
        <h3>{attentionCount}</h3>
      </div>
    </article>

    <article className="panel crops-summary-card">
      <span className="crops-summary-icon summary-critical"><AlertTriangle size={22} /></span>
      <div>
        <p>Critical</p>
        <h3>{criticalCount}</h3>
      </div>
    </article>
  </div>

  <div className="panel crops-toolbar">
    <label className="crops-search">
      <Search size={19} />
      <input
        type="search"
        placeholder="Search crops or fields..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search crops or fields"
      />
    </label>

    <label className="crops-select-label">
      <span>Health status</span>
      <select
        value={healthFilter}
        onChange={(event) => setHealthFilter(event.target.value)}
      >
        <option>All</option>
        <option>Healthy</option>
        <option>Needs Attention</option>
        <option>Critical</option>
      </select>
    </label>

    <label className="crops-select-label">
      <span>Sort by</span>
      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value)}
      >
        <option value="name">Crop name</option>
        <option value="quantity">Quantity: highest first</option>
        <option value="health">Health score: highest first</option>
      </select>
    </label>
  </div>

  <div className="crops-results-heading">
    <div>
      <h3>Your Crops</h3>
      <p>
        Showing {filteredCrops.length} of {crops.length} crop records
      </p>
    </div>
  </div>

  {filteredCrops.length > 0 ? (
    <div className="crops-list-grid">
      {filteredCrops.map((crop) => {
        const status = getHealthStatus(crop.health);
        const healthClass = getHealthClass(crop.health);

        return (
          <article className="panel crop-management-card" key={crop.id}>
            <div className="crop-management-top">
              <span className={`crop-icon-box ${healthClass}`}>
                <Leaf size={25} />
              </span>

              <span className={`crop-health-badge ${healthClass}`}>
                {status}
              </span>
            </div>

            <div className="crop-management-info">
              <h3>{crop.name}</h3>
              <p>{crop.field}</p>
            </div>

            <div className="crop-quantity-row">
              <span>Available quantity</span>
              <strong>
                {crop.quantity.toLocaleString()} kg
              </strong>
            </div>

            <div className="crop-health-details">
              <div className="crop-health-label-row">
                <span>Health score</span>
                <strong>{crop.health}%</strong>
              </div>

              <div
                className="crop-health-track"
                role="progressbar"
                aria-label={`${crop.name} health score`}
                aria-valuenow={crop.health}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`crop-health-fill ${healthClass}`}
                  style={{ width: `${crop.health}%` }}
                />
              </div>
            </div>

            <div className="crop-card-actions">
              <button
                type="button"
                className="crop-edit-button"
                onClick={() => openEditModal(crop)}
                aria-label={`Edit ${crop.name}`}
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                type="button"
                className="crop-delete-button"
                onClick={() => deleteCrop(crop.id)}
                aria-label={`Delete ${crop.name}`}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  ) : (
    <div className="panel crops-empty-state">
      <Sprout size={36} />
      <h3>No crops found</h3>
      <p>Try changing your search or health filter.</p>
    </div>
  )}

  {modalOpen && (
    <div
      className="crops-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setModalOpen(false);
        }
      }}
    >
      <section
        className="crops-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-modal-title"
      >
        <div className="crops-modal-heading">
          <div>
            <span className="crops-eyebrow">CROP RECORDS</span>
            <h3 id="crop-modal-title">
              {editingId !== null ? "Edit Crop" : "Add New Crop"}
            </h3>
          </div>

          <button
            type="button"
            className="crops-modal-close"
            onClick={() => setModalOpen(false)}
            aria-label="Close form"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Crop name
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="e.g. Wheat"
              required
            />
          </label>

          <label>
            Field name
            <input
              type="text"
              value={form.field}
              onChange={(event) =>
                setForm({ ...form, field: event.target.value })
              }
              placeholder="e.g. Field A"
              required
            />
          </label>

          <label>
            Quantity (kg)
            <input
              type="number"
              min="0"
              step="any"
              value={form.quantity}
              onChange={(event) =>
                setForm({ ...form, quantity: event.target.value })
              }
              placeholder="Enter quantity"
              required
            />
          </label>

          <label>
            Health score (0–100)
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={form.health}
              onChange={(event) =>
                setForm({ ...form, health: event.target.value })
              }
              required
            />
          </label>

          {formError && (
            <p className="crops-form-error" role="alert">
              {formError}
            </p>
          )}

          <div className="crops-modal-actions">
            <button
              type="button"
              className="crop-cancel-button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="crops-primary-button">
              {editingId !== null ? "Save Changes" : "Add Crop"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )}
</section>

);
}

export default Crops;
