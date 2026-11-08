import {
  deleteAttendance,
} from "../../features/attendance/attendanceSlice.js";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../app/redux/store/index.js";

import {
  addWorker,
  updateWorker,
  deleteWorker,
  updateWorkerStatus,
} from "../../features/workers/workersSlice.js";

import { validateWorker } from "../../features/workers/workerUtils.js";

import {
  Users,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  Wallet,
  UserCheck,
  UserX,
} from "lucide-react";

import "../../App.css";

function Workers() {
  const dispatch = useDispatch();

  const workers = useSelector((state) => state.workers || []);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === "Admin";

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = {
    name: "",
    cnic: "",
    phone: "",
    role: "",
    dailyWage: "",
    joinDate: new Date().toISOString().slice(0, 10),
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  );

  const inactiveWorkers = workers.filter(
    (worker) => worker.status === "Inactive"
  );

  const dailyLabourCost = activeWorkers.reduce(
    (total, worker) => total + Number(worker.dailyWage || 0),
    0
  );

  const filteredWorkers = workers.filter((worker) => {
  const query = search.trim().toLowerCase();

  if (!query) return true;

  return (
    (worker.name || "").toLowerCase().includes(query) ||
    (worker.cnic || "").includes(query.replace(/\D/g, "")) ||
    (worker.role || "").toLowerCase().includes(query)
  );
});
function closeModal() {
  setModalOpen(false);
  setEditingId(null);
  setForm(emptyForm);
  setError("");
}

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditForm(worker) {
    if (!isAdmin) return;

    setEditingId(worker.id);

    setForm({
      name: worker.name || "",
      cnic: worker.cnic || "",
      phone: worker.phone || "",
      role: worker.role || "",
      dailyWage: String(worker.dailyWage || ""),
      joinDate: worker.joinDate || "",
      status: worker.status || "Active",
    });

    setError("");
    setModalOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (editingId !== null && !isAdmin) {
      setError("Only Admin can edit worker records.");
      return;
    }

    const workerData = {
      ...form,
      name: form.name.trim(),
      cnic: form.cnic.replace(/\D/g, ""),
      phone: form.phone.replace(/\D/g, ""),
      dailyWage: Number(form.dailyWage),
    };

    const validationErrors = validateWorker(
      workerData,
      workers,
      editingId
    );

    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      return;
    }

    if (!workerData.role) {
      setError("Please select a worker role.");
      return;
    }

    if (!workerData.joinDate) {
      setError("Please select a joining date.");
      return;
    }

    if (editingId !== null) {
      dispatch(
        updateWorker({
          ...workerData,
          id: editingId,
          updatedAt: new Date().toISOString(),
        })
      );

      setSuccess("Worker details updated successfully.");
    } else {
      dispatch(
        addWorker({
          ...workerData,
          id: `worker-${Date.now()}`,
          createdAt: new Date().toISOString(),
        })
      );

      setSuccess("New worker registered successfully.");
    }

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleDelete(worker) {
  if (!isAdmin) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete ${worker.name}? This will also remove their attendance records.`
  );

  if (!confirmed) return;

  // Remove worker
  dispatch(deleteWorker(worker.id));

  // Remove attendance records belonging to this worker
  const attendance = store.getState().attendance || [];

  attendance
    .filter((record) => record.workerId === worker.id)
    .forEach((record) => {
      dispatch(deleteAttendance(record.id));
    });

  setSuccess(`${worker.name} and their attendance records have been deleted.`);
}

  function handleStatusChange(worker) {
    if (!isAdmin) return;

    const newStatus =
      worker.status === "Active" ? "Inactive" : "Active";

    dispatch(
      updateWorkerStatus({
        id: worker.id,
        status: newStatus,
      })
    );
  }

  return (
    <section className="workers-page">

      {/* Page heading */}
      <div className="workers-heading">
        <div>
          <span className="workers-eyebrow">
            FARM OPERATIONS
          </span>

          <h2>Workers & Labour Management</h2>

          <p>
            Manage farm workers, registration details and labour costs.
          </p>
        </div>

        <button
          type="button"
          className="workers-primary-button"
          onClick={openAddForm}
        >
          <UserPlus size={18} />
          Add Worker
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="workers-success" role="status">
          {success}

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="workers-summary">

        <article className="panel workers-summary-card">
          <Users size={24} />
          <div>
            <p>Total Workers</p>
            <h3>{workers.length}</h3>
          </div>
        </article>

        <article className="panel workers-summary-card">
          <UserCheck size={24} />
          <div>
            <p>Active Workers</p>
            <h3>{activeWorkers.length}</h3>
          </div>
        </article>

        <article className="panel workers-summary-card">
          <UserX size={24} />
          <div>
            <p>Inactive Workers</p>
            <h3>{inactiveWorkers.length}</h3>
          </div>
        </article>

        <article className="panel workers-summary-card">
          <Wallet size={24} />
          <div>
            <p>Daily Labour Cost</p>
            <h3>
              Rs. {dailyLabourCost.toLocaleString("en-PK")}
            </h3>
          </div>
        </article>

      </div>

      {/* Search */}
      <div className="panel workers-toolbar">
        <Search size={19} />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search workers by name, CNIC or role..."
          aria-label="Search workers"
        />
      </div>

      {/* Worker list heading */}
      <div className="workers-list-heading">
        <div>
          <h3>Registered Workers</h3>

          <p>
            Showing {filteredWorkers.length} of {workers.length} workers
          </p>
        </div>
      </div>

      {/* Worker cards */}
      {filteredWorkers.length === 0 ? (
        <div className="panel workers-empty">
          <Users size={38} />
          <h3>No workers found</h3>

          <p>
            Add your first worker or try another search.
          </p>
        </div>
      ) : (
        <div className="workers-grid">

          {filteredWorkers.map((worker) => (
            <article
              className="panel worker-card"
              key={worker.id}
            >

              <div className="worker-card-top">

                <div className="worker-avatar">
                  {worker.name.charAt(0).toUpperCase()}
                </div>

                <div className="worker-main-info">
                  <h3>{worker.name}</h3>
                  <p>{worker.role}</p>
                </div>

                <span
                  className={`worker-status ${
                    worker.status === "Active"
                      ? "worker-active"
                      : "worker-inactive"
                  }`}
                >
                  {worker.status}
                </span>

              </div>

              <div className="worker-detail-row">
                <span>CNIC</span>
                <strong>{worker.cnic}</strong>
              </div>

              <div className="worker-detail-row">
                <span>Phone</span>
                <strong>{worker.phone}</strong>
              </div>

              <div className="worker-detail-row">
                <span>Daily Wage</span>
                <strong>
                  Rs. {Number(worker.dailyWage).toLocaleString("en-PK")}
                </strong>
              </div>

              <div className="worker-detail-row">
                <span>Joining Date</span>
                <strong>{worker.joinDate}</strong>
              </div>

              {isAdmin && (
                <div className="worker-actions">

                  <button
                    type="button"
                    className="worker-status-button"
                    onClick={() => handleStatusChange(worker)}
                  >
                    {worker.status === "Active"
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    type="button"
                    className="worker-edit-button"
                    onClick={() => openEditForm(worker)}
                    aria-label={`Edit ${worker.name}`}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="worker-delete-button"
                    onClick={() => handleDelete(worker)}
                    aria-label={`Delete ${worker.name}`}
                  >
                    <Trash2 size={17} />
                  </button>

                </div>
              )}

            </article>
          ))}

        </div>
      )}

      {/* Add/Edit Worker Modal */}
      {modalOpen && (
        <div
          className="workers-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="workers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workers-modal-title"
          >

            <div className="workers-modal-heading">

              <div>
                <span className="workers-eyebrow">
                  WORKER REGISTRATION
                </span>

                <h3 id="workers-modal-title">
                  {editingId !== null
                    ? "Edit Worker"
                    : "Register New Worker"}
                </h3>
              </div>

              <button
                type="button"
                className="workers-close-button"
                onClick={closeModal}
                aria-label="Close form"
              >
                <X size={21} />
              </button>

            </div>

            <form
              className="workers-form"
              onSubmit={handleSubmit}
            >

              <label>
                Full Name

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Ahmed Khan"
                  required
                />
              </label>

              <label>
                CNIC (13 digits)

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={13}
                  value={form.cnic}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      cnic: event.target.value.replace(/\D/g, "").slice(0, 13),
                    })
                  }
                  placeholder="3520212345671"
                  required
                />
              </label>

              <label>
                Phone Number

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value.replace(/\D/g, "").slice(0, 11),
                    })
                  }
                  placeholder="03XXXXXXXXX"
                  required
                />
              </label>

              <label>
                Worker Role

                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      role: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select role</option>
                  <option value="Farm Worker">Farm Worker</option>
                  <option value="Tractor Operator">Tractor Operator</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Irrigation Worker">Irrigation Worker</option>
                  <option value="Harvest Worker">Harvest Worker</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Daily Wage (PKR)

                <input
                  type="number"
                  min="1"
                  value={form.dailyWage}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      dailyWage: event.target.value,
                    })
                  }
                  placeholder="e.g. 1500"
                  required
                />
              </label>

              <label>
                Joining Date

                <input
                  type="date"
                  value={form.joinDate}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      joinDate: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Worker Status

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              {error && (
                <p className="workers-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="workers-form-actions">

                <button
                  type="button"
                  className="workers-cancel-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="workers-primary-button"
                >
                  <UserPlus size={17} />

                  {editingId !== null
                    ? "Save Changes"
                    : "Register Worker"}
                </button>

              </div>

            </form>
          </section>
        </div>
      )}

    </section>
  );
}

export default Workers;