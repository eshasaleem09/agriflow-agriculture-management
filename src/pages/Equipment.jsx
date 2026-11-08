import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tractor,
  Wrench,
  CalendarDays,
  X,
} from "lucide-react";

import {
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "../features/equipment/equipmentSlice.js";

import {
  EQUIPMENT_TYPES,
  EQUIPMENT_STATUSES,
  validateEquipment,
  calculateNextServiceDate,
  getServiceStatus,
} from "../features/equipment/equipmentUtils.js";

function Equipment() {
  const dispatch = useDispatch();

  // Redux state
  const equipment = useSelector((state) => state.equipment || []);
  const maintenance = useSelector(
    (state) => state.maintenance || []
  );
  const user = useSelector((state) => state.auth?.user);

  // Only Admin can manage equipment
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Component state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const emptyForm = {
    name: "",
    type: "Tractor",
    purchaseDate: "",
    status: "Active",
    lastServiceDate: "",
    serviceIntervalDays: "30",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  // Search and status filtering
  const filteredEquipment = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch =
        String(item.name || "").toLowerCase().includes(query) ||
        String(item.type || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [equipment, search, statusFilter]);

  // Service summary
  const serviceCounts = useMemo(() => {
    return equipment.reduce(
      (counts, item) => {
        const nextDate = calculateNextServiceDate(
          item.lastServiceDate,
          item.serviceIntervalDays
        );

        const status = getServiceStatus(nextDate);

        if (status === "Overdue") counts.overdue++;
        if (status === "Due in 7 days") counts.due++;

        return counts;
      },
      { overdue: 0, due: 0 }
    );
  }, [equipment]);

  // Open add form
  function openAddModal() {
    if (!isAdmin) return;

    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  }

  // Open edit form
  function openEditModal(item) {
    if (!isAdmin) return;

    setForm({
      ...emptyForm,
      ...item,
      purchaseDate: item.purchaseDate || "",
      lastServiceDate: item.lastServiceDate || "",
      serviceIntervalDays: String(
        item.serviceIntervalDays || 30
      ),
    });

    setEditingId(item.id);
    setErrors({});
    setShowModal(true);
  }

  // Close modal
  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  // Handle form inputs
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Add or update equipment
  function handleSubmit(event) {
    event.preventDefault();

    if (!isAdmin) return;

    const validationErrors = validateEquipment(
      form,
      equipment,
      editingId
    );

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const existingEquipment = equipment.find(
      (item) => String(item.id) === String(editingId)
    );

    const record = {
      ...form,
      id:
        editingId !== null
          ? editingId
          : `equipment-${Date.now()}`,

      serviceIntervalDays: Number(
        form.serviceIntervalDays
      ),

      initialLastServiceDate:
        existingEquipment?.initialLastServiceDate ||
        existingEquipment?.lastServiceDate ||
        form.lastServiceDate,

      updatedAt: new Date().toISOString(),
    };

    if (editingId !== null) {
      dispatch(updateEquipment(record));
      setSuccess("Equipment updated successfully.");
    } else {
      dispatch(
        addEquipment({
          ...record,
          createdAt: new Date().toISOString(),
        })
      );

      setSuccess("Equipment added successfully.");
    }

    closeModal();
  }

  // Delete equipment
  function handleDelete(id) {
    if (!isAdmin) return;

    const hasMaintenance = maintenance.some(
      (record) =>
        String(record.equipmentId) === String(id)
    );

    if (hasMaintenance) {
      window.alert(
        "This equipment has maintenance records. Delete its maintenance records first."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this equipment?"
    );

    if (!confirmed) return;

    dispatch(deleteEquipment(id));

    setSuccess("Equipment deleted successfully.");
  }

  // Status CSS class
  function getStatusClass(status) {
    return String(status || "unknown")
      .toLowerCase()
      .replaceAll(" ", "-");
  }

  return (
    <div className="management-page">

      {/* Page heading */}
      <div className="page-header">
        <div>
          <h2>Equipment Management</h2>
          <p>
            Manage your farm machinery and equipment.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="primary-button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add Equipment
          </button>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="success-message" role="status">
          {success}

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="equipment-summary">

        <div className="summary-card">
          <Tractor size={24} />

          <div>
            <span>Total Equipment</span>
            <h3>{equipment.length}</h3>
          </div>
        </div>

        <div className="summary-card">
          <Wrench size={24} />

          <div>
            <span>Overdue Services</span>
            <h3>{serviceCounts.overdue}</h3>
          </div>
        </div>

        <div className="summary-card">
          <CalendarDays size={24} />

          <div>
            <span>Due Within 7 Days</span>
            <h3>{serviceCounts.due}</h3>
          </div>
        </div>

      </div>

      {/* Equipment table */}
      <div className="table-card">

        {/* Search and filter */}
        <div className="table-toolbar">

          <div className="search-input">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search equipment..."
              aria-label="Search equipment"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter equipment by status"
          >
            <option value="All">All Statuses</option>

            {EQUIPMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

        </div>

        {/* Equipment list */}
        <div className="table-responsive">

          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Service</th>
                <th>Next Service</th>
                <th>Service Condition</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEquipment.map((item) => {
                const nextDate = calculateNextServiceDate(
                  item.lastServiceDate,
                  item.serviceIntervalDays
                );

                const serviceStatus =
                  getServiceStatus(nextDate);

                return (
                  <tr key={item.id}>

                    <td>{item.name || "Unnamed equipment"}</td>

                    <td>{item.type || "Other"}</td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </td>

                    <td>
                      {item.lastServiceDate || "Not recorded"}
                    </td>

                    <td>
                      {nextDate || "Not scheduled"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          serviceStatus
                        )}`}
                      >
                        {serviceStatus}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(item)
                              }
                              title="Edit equipment"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              title="Delete equipment"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}

                        {!isAdmin && (
                          <span>View only</span>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredEquipment.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No equipment found. Try another search or filter.
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        </div>
      </div>

      {/* Add/Edit modal */}
      {showModal && isAdmin && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="management-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipment-modal-title"
          >

            <div className="modal-header">

              <div>
                <h3 id="equipment-modal-title">
                  {editingId !== null
                    ? "Edit Equipment"
                    : "Add Equipment"}
                </h3>

                <p>Enter equipment information.</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close form"
              >
                <X />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <label>
                  Equipment Name

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Massey Ferguson Tractor"
                    required
                  />

                  {errors.name && (
                    <small>{errors.name}</small>
                  )}
                </label>

                <label>
                  Equipment Type

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    {EQUIPMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  {errors.type && (
                    <small>{errors.type}</small>
                  )}
                </label>

                <label>
                  Purchase Date

                  <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                    required
                  />

                  {errors.purchaseDate && (
                    <small>{errors.purchaseDate}</small>
                  )}
                </label>

                <label>
                  Equipment Status

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {EQUIPMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {errors.status && (
                    <small>{errors.status}</small>
                  )}
                </label>

                <label>
                  Last Service Date

                  <input
                    type="date"
                    name="lastServiceDate"
                    value={form.lastServiceDate}
                    onChange={handleChange}
                  />

                  {errors.lastServiceDate && (
                    <small>{errors.lastServiceDate}</small>
                  )}
                </label>

                <label>
                  Service Interval (Days)

                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="serviceIntervalDays"
                    value={form.serviceIntervalDays}
                    onChange={handleChange}
                    required
                  />

                  {errors.serviceIntervalDays && (
                    <small>{errors.serviceIntervalDays}</small>
                  )}
                </label>

                <label className="full-width">
                  Notes

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                  />
                </label>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingId !== null
                    ? "Save Changes"
                    : "Add Equipment"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Equipment;