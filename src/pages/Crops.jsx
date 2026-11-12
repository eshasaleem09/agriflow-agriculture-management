import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addCrop,
  updateCrop,
  deleteCrop,
} from "../features/crops/cropsSlice.js";

import {
  getHealthStatus,
  getHealthClass,
  validateCrop,
} from "../features/crops/cropsUtils.js";

import { apiClient } from "../app/redux/api/index.js";

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

// Convert backend crop fields into the existing frontend structure.
const mapBackendCrop = (crop) => ({
  id: crop.id,
  name: crop.name || "",
  field: crop.field || "",
  quantity: Number(crop.expectedQty ?? 0),
  health: Number(crop.healthScore ?? 0),
});

const getCropStatus = (health) => {
  if (health >= 70) return "Healthy";
  if (health >= 40) return "Needs Attention";
  return "Critical";
};

function Crops() {
  const dispatch = useDispatch();

  const crops = useSelector((state) => state.crops || []);
  const user = useSelector((state) => state.auth?.user);

  const isAdmin =
    user?.role?.toLowerCase() === "admin";

  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    health: "80",
    field: "",
  });

  // Fetch crops from PostgreSQL through the backend.
  useEffect(() => {
    let mounted = true;

    const fetchCrops = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get("/crops");

        const backendData = response.data?.data;

        const backendCrops = Array.isArray(backendData)
          ? backendData.map(mapBackendCrop)
          : [];

        if (mounted) {
          dispatch({
            type: "app/HYDRATE_STATE",
            payload: {
              crops: backendCrops,
            },
          });
        }
      } catch (error) {
        console.error(
          "Failed to fetch crops:",
          error.response?.data || error.message
        );

        if (mounted) {
          setFormError(
            error.response?.data?.message ||
              "Unable to load crops from the server."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCrops();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Search, filter and sort crops.
  const filteredCrops = useMemo(() => {
    const result = crops.filter((crop) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        (crop.name || "").toLowerCase().includes(searchTerm) ||
        (crop.field || "").toLowerCase().includes(searchTerm);

      const matchesHealth =
        healthFilter === "All" ||
        getHealthStatus(crop.health) === healthFilter;

      return matchesSearch && matchesHealth;
    });

    return result.sort((a, b) => {
      if (sortBy === "quantity") {
        return b.quantity - a.quantity;
      }

      if (sortBy === "health") {
        return b.health - a.health;
      }

      return a.name.localeCompare(b.name);
    });
  }, [crops, search, healthFilter, sortBy]);

  // Crop health summaries.
  const healthyCount = crops.filter(
    (crop) => crop.health >= 70
  ).length;

  const attentionCount = crops.filter(
    (crop) => crop.health >= 40 && crop.health < 70
  ).length;

  const criticalCount = crops.filter(
    (crop) => crop.health < 40
  ).length;

  // Open add crop modal.
  function openAddModal() {
    setEditingId(null);

    setForm({
      name: "",
      quantity: "",
      health: "80",
      field: "",
    });

    setFormError("");
    setModalOpen(true);
  }

  // Open edit crop modal.
  function openEditModal(crop) {
    if (!isAdmin) return;

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

  // Validate and save crop through backend.
  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    if (editingId !== null && !isAdmin) {
      setFormError("You do not have permission to edit crops.");
      return;
    }

    const validationErrors = validateCrop(
      form,
      crops,
      editingId
    );

    if (Object.keys(validationErrors).length > 0) {
      setFormError(Object.values(validationErrors)[0]);
      return;
    }

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

    if (
      !Number.isInteger(health) ||
      health < 0 ||
      health > 100
    ) {
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

    const backendCrop = {
      name,
      field,
      expectedQty: quantity,
      healthScore: health,
      status: getCropStatus(health),
    };

    try {
      setSaving(true);
      setFormError("");

      if (editingId !== null) {
        const response = await apiClient.put(
          `/crops/${editingId}`,
          backendCrop
        );

        const savedCrop = mapBackendCrop(
          response.data?.data
        );

        dispatch(updateCrop(savedCrop));
      } else {
        const response = await apiClient.post(
          "/crops",
          backendCrop
        );

        const savedCrop = mapBackendCrop(
          response.data?.data
        );

        dispatch(addCrop(savedCrop));
      }

      setModalOpen(false);
      setEditingId(null);

      setForm({
        name: "",
        quantity: "",
        health: "80",
        field: "",
      });
    } catch (error) {
      console.error(
        "Crop save failed:",
        error.response?.data || error.message
      );

      setFormError(
        error.response?.data?.message ||
          "Unable to save crop. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete crop from backend.
  async function handleDeleteCrop(id) {
    if (!isAdmin) return;

    const crop = crops.find((item) => item.id === id);

    if (!crop) return;

    const confirmed = window.confirm(
      `Delete ${crop.name} from crop records?`
    );

    if (!confirmed) return;

    try {
      await apiClient.delete(`/crops/${id}`);

      dispatch(deleteCrop(id));
    } catch (error) {
      console.error(
        "Crop deletion failed:",
        error.response?.data || error.message
      );

      window.alert(
        error.response?.data?.message ||
          "Unable to delete crop."
      );
    }
  }

  return (
    <section className="crops-page">

      {/* Page heading */}
      <div className="crops-heading">
        <div>
          <span className="crops-eyebrow">
            FARM OPERATIONS
          </span>

          <h2>Crop Management</h2>

          <p>
            Monitor crop health, manage inventory, and maintain
            farm records.
          </p>
        </div>

        <button
          type="button"
          className="crops-primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Crop
        </button>
      </div>

      {/* Crop summaries */}
      <div className="crops-summary-grid">

        <article className="panel crops-summary-card">
          <span className="crops-summary-icon">
            <Sprout size={22} />
          </span>

          <div>
            <p>Total Crops</p>
            <h3>{crops.length}</h3>
          </div>
        </article>

        <article className="panel crops-summary-card">
          <span className="crops-summary-icon summary-healthy">
            <CheckCircle2 size={22} />
          </span>

          <div>
            <p>Healthy</p>
            <h3>{healthyCount}</h3>
          </div>
        </article>

        <article className="panel crops-summary-card">
          <span className="crops-summary-icon summary-attention">
            <Activity size={22} />
          </span>

          <div>
            <p>Needs Attention</p>
            <h3>{attentionCount}</h3>
          </div>
        </article>

        <article className="panel crops-summary-card">
          <span className="crops-summary-icon summary-critical">
            <AlertTriangle size={22} />
          </span>

          <div>
            <p>Critical</p>
            <h3>{criticalCount}</h3>
          </div>
        </article>

      </div>

      {/* Search, filter and sort */}
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
            onChange={(event) =>
              setHealthFilter(event.target.value)
            }
          >
            <option value="All">All</option>
            <option value="Healthy">Healthy</option>
            <option value="Needs Attention">
              Needs Attention
            </option>
            <option value="Critical">Critical</option>
          </select>
        </label>

        <label className="crops-select-label">
          <span>Sort by</span>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="name">Crop name</option>
            <option value="quantity">
              Quantity: highest first
            </option>
            <option value="health">
              Health score: highest first
            </option>
          </select>
        </label>

      </div>

      {/* Results heading */}
      <div className="crops-results-heading">
        <div>
          <h3>Your Crops</h3>

          <p>
            Showing {filteredCrops.length} of {crops.length} crop
            records
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel crops-empty-state">
          <p>Loading crops from database...</p>
        </div>
      )}

      {/* Crop cards */}
      {!loading && filteredCrops.length > 0 && (
        <div className="crops-list-grid">

          {filteredCrops.map((crop) => {
            const status = getHealthStatus(crop.health);
            const healthClass = getHealthClass(crop.health);

            return (
              <article
                className="panel crop-management-card"
                key={crop.id}
              >

                <div className="crop-management-top">
                  <span className={`crop-icon-box ${healthClass}`}>
                    <Leaf size={25} />
                  </span>

                  <span
                    className={`crop-health-badge ${healthClass}`}
                  >
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
                    {Number(crop.quantity).toLocaleString()} kg
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

                {/* Admin actions */}
                {isAdmin && (
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
                      onClick={() => handleDeleteCrop(crop.id)}
                      aria-label={`Delete ${crop.name}`}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>
                )}

              </article>
            );
          })}

        </div>
      )}

      {/* Empty state */}
      {!loading && filteredCrops.length === 0 && (
        <div className="panel crops-empty-state">
          <Sprout size={36} />

          <h3>No crops found</h3>

          <p>
            Try changing your search or health filter.
          </p>
        </div>
      )}

      {/* Add/Edit modal */}
      {modalOpen && (
        <div
          className="crops-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
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
                <span className="crops-eyebrow">
                  CROP RECORDS
                </span>

                <h3 id="crop-modal-title">
                  {editingId !== null
                    ? "Edit Crop"
                    : "Add New Crop"}
                </h3>
              </div>

              <button
                type="button"
                className="crops-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close form"
                disabled={saving}
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
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
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
                    setForm({
                      ...form,
                      field: event.target.value,
                    })
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
                    setForm({
                      ...form,
                      quantity: event.target.value,
                    })
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
                    setForm({
                      ...form,
                      health: event.target.value,
                    })
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
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="crops-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Add Crop"}
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