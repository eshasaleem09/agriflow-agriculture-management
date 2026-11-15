import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import {
  setMaintenance,
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "../features/maintenance/maintenanceSlice.js";
import {
  setEquipment,
  updateLastServiceDate,
} from "../features/equipment/equipmentSlice.js";

import {
  setExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../features/expenses/expensesSlice.js";
import {
  validateMaintenance,
  getLatestServiceDate,
} from "../features/maintenance/maintenanceUtils.js";
import {
  getResources,
  updateResource,
} from "../app/redux/api/resourceHelpers.js";

import {
  createMaintenanceApi,
  updateMaintenanceApi,
  deleteMaintenanceApi,
} from "../app/redux/api/maintenanceApi.js";

// Get local date in YYYY-MM-DD format
function getLocalDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Maintenance() {
  const dispatch = useDispatch();

  // Redux state
  const equipment = useSelector(
    (state) => state.equipment || []
  );

  const maintenance = useSelector(
    (state) => state.maintenance || []
  );

  const expenses = useSelector(
    (state) => state.expenses || []
  );

  const user = useSelector(
    (state) => state.auth?.user
  );

  // Only Admin can manage maintenance
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Component state
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const emptyForm = {
    equipmentId: "",
    date: getLocalDate(),
    description: "",
    cost: "",
    performedBy: "",
  };

  const [form, setForm] = useState(emptyForm);
  useEffect(() => {
  const loadMaintenanceData = async () => {
    try {
      const [maintenanceRecords, equipmentRecords, expenseRecords] =
        await Promise.all([
          getResources("maintenance"),
          getResources("equipment"),
          getResources("expenses"),
        ]);

      dispatch(setMaintenance(maintenanceRecords));

      dispatch(
        setEquipment(
          equipmentRecords.map((item) => ({
            ...item,
            initialLastServiceDate:
              item.initialLastServiceDate || item.lastServiceDate || "",
          }))
        )
      );

      dispatch(
        setExpenses(
          expenseRecords.map((item) => ({
            ...item,
            notes: item.note || "",
          }))
        )
      );
    } catch (error) {
      console.error("Failed to load maintenance data:", error);
      setSuccess("Could not load maintenance data from the server.");
    }
  };

  loadMaintenanceData();
}, [dispatch]);

  // Search maintenance records
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return maintenance.filter((record) => {
      const machine = equipment.find(
        (item) =>
          String(item.id) === String(record.equipmentId)
      );

      return (
        String(machine?.name || "")
          .toLowerCase()
          .includes(query) ||
        String(record.description || "")
          .toLowerCase()
          .includes(query) ||
        String(record.performedBy || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [maintenance, equipment, search]);

  // Calculate total maintenance cost
  const totalCost = useMemo(() => {
    return maintenance.reduce(
      (total, record) =>
        total + (Number(record.cost) || 0),
      0
    );
  }, [maintenance]);

async function refreshEquipmentServiceDate(equipmentId, records) {
  const machine = equipment.find(
    (item) => String(item.id) === String(equipmentId)
  );

  if (!machine) return;

  const latestDate = getLatestServiceDate(
    equipmentId,
    records,
    machine.initialLastServiceDate ||
      machine.lastServiceDate ||
      ""
  );

  try {
    await updateResource("equipment", machine.id, {
      lastServiceDate: latestDate || null,
    });

    dispatch(
      updateLastServiceDate({
        id: machine.id,
        lastServiceDate: latestDate,
      })
    );
  } catch (error) {
    console.error("Equipment service date update failed:", error);
    throw error;
  }
}

  // Open add modal
  function openAddModal() {
    if (!isAdmin) return;

    if (equipment.length === 0) {
      window.alert(
        "Please add equipment before recording maintenance."
      );
      return;
    }

    setForm({
      ...emptyForm,
      equipmentId: String(equipment[0].id),
    });

    setEditingId(null);
    setErrors({});
    setShowModal(true);
  }

  // Open edit modal
  function openEditModal(record) {
    if (!isAdmin) return;

    setForm({
      equipmentId: String(record.equipmentId),
      date: record.date || getLocalDate(),
      description: record.description || "",
      cost: String(record.cost ?? ""),
      performedBy: record.performedBy || "",
    });

    setEditingId(record.id);
    setErrors({});
    setShowModal(true);
  }

  // Close and reset modal
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
  async function handleSubmit(event) {
  event.preventDefault();

  if (!isAdmin) return;

  if (equipment.length === 0) {
    window.alert(
      "Please add equipment before recording maintenance."
    );
    return;
  }

  const validationErrors = validateMaintenance(form, equipment);

  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) return;

  const oldRecord = maintenance.find(
    (item) => String(item.id) === String(editingId)
  );

  const payload = {
    equipmentId: form.equipmentId,
    date: form.date,
    description: form.description.trim(),
    cost: Number(form.cost),
    performedBy: form.performedBy.trim(),
  };

  try {
    let result;

if (editingId !== null) {
  result = await updateMaintenanceApi(editingId, payload);
} else {
  result = await createMaintenanceApi(payload);
}

if (!result.succeeded) {
  throw new Error(result.message || "Maintenance operation failed.");
}

const savedRecord = result.data.maintenance;
const savedExpenses = result.data.expenses || [];

// Update Maintenance Redux state
if (editingId !== null) {
  dispatch(updateMaintenance(savedRecord));
} else {
  dispatch(addMaintenance(savedRecord));
}

// Update linked Expenses Redux state
savedExpenses.forEach((expense) => {
  const normalizedExpense = {
    ...expense,
    notes: expense.note || "",
  };

  const alreadyExists = expenses.some(
    (item) => String(item.id) === String(expense.id)
  );

  if (alreadyExists) {
    dispatch(updateExpense(normalizedExpense));
  } else {
    dispatch(addExpense(normalizedExpense));
  }
});

    const updatedRecords =
      editingId !== null
        ? maintenance.map((item) =>
            String(item.id) === String(editingId)
              ? savedRecord
              : item
          )
        : [...maintenance, savedRecord];

    // Recalculate previous equipment if equipment changed
    if (
      editingId !== null &&
      String(oldRecord?.equipmentId) !==
        String(savedRecord.equipmentId)
    ) {
      const oldEquipmentRecords = maintenance.filter(
        (item) => String(item.id) !== String(editingId)
      );

      await refreshEquipmentServiceDate(
        oldRecord.equipmentId,
        oldEquipmentRecords
      );
    }

    await refreshEquipmentServiceDate(
      savedRecord.equipmentId,
      updatedRecords
    );

    setSuccess(
      editingId !== null
        ? "Maintenance record updated successfully."
        : "Maintenance record added successfully."
    );

    closeModal();
  } catch (error) {
    console.error("Maintenance save failed:", error);

    setSuccess(
      error.response?.data?.message ||
      "Could not save maintenance record. Please try again."
    );
  }
}
 async function handleDelete(record) {
  if (!isAdmin) return;

  const confirmed = window.confirm(
    "Are you sure you want to delete this maintenance record? Its linked expense will also be removed."
  );

  if (!confirmed) return;

  try {
    // Delete Maintenance and linked Expenses through one transaction
    const result = await deleteMaintenanceApi(record.id);

    if (!result.succeeded) {
      throw new Error(result.message || "Maintenance deletion failed.");
    }

    // Remove linked Expenses from Redux
    const deletedExpenseIds = result.data?.deletedExpenseIds || [];

    deletedExpenseIds.forEach((id) => {
      dispatch(deleteExpense(id));
    });

    // Remove Maintenance from Redux
    dispatch(deleteMaintenance(record.id));

    const remainingRecords = maintenance.filter(
      (item) => String(item.id) !== String(record.id)
    );

    // Recalculate equipment service date
    await refreshEquipmentServiceDate(
      record.equipmentId,
      remainingRecords
    );

    setSuccess("Maintenance record deleted successfully.");
   } catch (error) {
    console.error("Maintenance deletion failed:", error);

    setSuccess(
      error.response?.data?.message ||
      error.message ||
      "Could not delete maintenance record. Please try again."
    );
  }
}

return (
  <div className="management-page">

      {/* Page heading */}
      <div className="page-header">
        <div>
          <h2>Maintenance Management</h2>

          <p>
            Track equipment servicing, repairs and maintenance costs.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="primary-button"
            onClick={openAddModal}
            disabled={equipment.length === 0}
          >
            <Plus size={18} />
            Add Service Record
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
          <Wrench size={24} />

          <div>
            <span>Total Service Records</span>
            <h3>{maintenance.length}</h3>
          </div>
        </div>

        <div className="summary-card">
          <Wrench size={24} />

          <div>
            <span>Total Maintenance Cost</span>
            <h3>
              Rs. {totalCost.toLocaleString("en-PK")}
            </h3>
          </div>
        </div>

        <div className="summary-card">
          <Wrench size={24} />

          <div>
            <span>Equipment</span>
            <h3>{equipment.length}</h3>
          </div>
        </div>

      </div>

      {/* Maintenance table */}
      <div className="table-card">

        <div className="table-toolbar">
          <div className="search-input">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search equipment or service..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search maintenance records"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table>

            <thead>
              <tr>
                <th>Equipment</th>
                <th>Date</th>
                <th>Description</th>
                <th>Cost</th>
                <th>Performed By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => {
                const machine = equipment.find(
                  (item) =>
                    String(item.id) ===
                    String(record.equipmentId)
                );

                return (
                  <tr key={record.id}>

                    <td>
                      {machine?.name || "Unknown equipment"}
                    </td>

                    <td>{record.date}</td>

                    <td>{record.description}</td>

                    <td>
                      Rs. {Number(record.cost || 0).toLocaleString("en-PK")}
                    </td>

                    <td>{record.performedBy || "Not specified"}</td>

                    <td>
                      <div className="action-buttons">

                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                openEditModal(record)
                              }
                              aria-label={`Edit maintenance record`}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete"
                              onClick={() =>
                                handleDelete(record)
                              }
                              aria-label="Delete maintenance record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span>View only</span>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No maintenance records found.
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
            aria-labelledby="maintenance-modal-title"
          >

            <div className="modal-header">

              <div>
                <h3 id="maintenance-modal-title">
                  {editingId !== null
                    ? "Edit Maintenance"
                    : "Add Maintenance"}
                </h3>

                <p>
                  Enter the service information below.
                </p>
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
                  Equipment

                  <select
                    name="equipmentId"
                    value={form.equipmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select equipment
                    </option>

                    {equipment.map((item) => (
                      <option
                        key={item.id}
                        value={String(item.id)}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {errors.equipmentId && (
                    <small>{errors.equipmentId}</small>
                  )}
                </label>

                <label>
                  Service Date

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />

                  {errors.date && (
                    <small>{errors.date}</small>
                  )}
                </label>

                <label className="full-width">
                  Description

                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Describe the repair or service..."
                    value={form.description}
                    onChange={handleChange}
                    required
                  />

                  {errors.description && (
                    <small>{errors.description}</small>
                  )}
                </label>

                <label>
                  Maintenance Cost (PKR)

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                    placeholder="Enter cost"
                    required
                  />

                  {errors.cost && (
                    <small>{errors.cost}</small>
                  )}
                </label>

                <label>
                  Performed By

                  <input
                    type="text"
                    name="performedBy"
                    value={form.performedBy}
                    onChange={handleChange}
                    placeholder="Mechanic or service provider"
                    required
                  />

                  {errors.performedBy && (
                    <small>{errors.performedBy}</small>
                  )}
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
                    : "Add Service"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default Maintenance;