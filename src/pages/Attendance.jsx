import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addAttendance,
  updateAttendance,
  deleteAttendance,
} from "../features/attendance/attendanceSlice.js";

import { addExpense } from "../features/expenses/expensesSlice.js";

import {
  calculateMonthlyWage,
} from "../features/workers/workerUtils.js";

import {
  validateAttendance,
  ATTENDANCE_STATUSES,
} from "../features/attendance/attendanceUtils.js";

import {
  CalendarDays,
  ClipboardCheck,
  Wallet,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";

function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Attendance() {
  const dispatch = useDispatch();

  const workers = useSelector((state) => state.workers || []);
  const attendance = useSelector((state) => state.attendance || []);
  const expenses = useSelector((state) => state.expenses || []);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [selectedMonth, setSelectedMonth] = useState(
    getLocalDate().slice(0, 7)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    workerId: "",
    date: getLocalDate(),
    status: "Present",
    notes: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeWorkers = workers.filter(
    (worker) => worker.status === "Active"
  );

  const todayRecords = attendance.filter(
    (record) => record.date === selectedDate
  );

  const presentToday = todayRecords.filter(
    (record) => record.status === "Present"
  ).length;

  const absentToday = todayRecords.filter(
    (record) => record.status === "Absent"
  ).length;

  const halfDayToday = todayRecords.filter(
    (record) => record.status === "Half-day"
  ).length;
const markedAttendance = presentToday + absentToday;

const absentPercentage =
  markedAttendance > 0
    ? (absentToday / markedAttendance) * 100
    : 0;

  const monthlyAttendance = useMemo(() => {
    return attendance.filter((record) =>
      record.date.startsWith(selectedMonth)
    );
  }, [attendance, selectedMonth]);

  const monthlyWages = activeWorkers.reduce((total, worker) => {
    const [year, month] = selectedMonth.split("-").map(Number);

    const summary = calculateMonthlyWage(
      attendance,
      worker.id,
      worker.dailyWage,
      month - 1,
      year
    );

    return total + summary.totalWage;
  }, 0);

  const sortedRecords = [...monthlyAttendance].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  function openAddModal() {
    setEditingId(null);

    setForm({
      workerId: activeWorkers[0]?.id || "",
      date: selectedDate,
      status: "Present",
      notes: "",
    });

    setError("");
    setModalOpen(true);
  }

  function openEditModal(record) {
    if (!isAdmin) return;

    setEditingId(record.id);

    setForm({
      workerId: record.workerId,
      date: record.date,
      status: record.status,
      notes: record.notes || "",
    });

    setError("");
    setModalOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (editingId !== null && !isAdmin) {
      setError("Only Admin can edit attendance.");
      return;
    }

    const validationErrors = validateAttendance(
  form,
  attendance,
  editingId,
  workers
);

    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      return;
    }

    const worker = workers.find(
  (item) => String(item.id) === String(form.workerId)
);

    if (!worker) {
      setError("Selected worker does not exist.");
      return;
    }

    const record = {
      ...form,
      id: editingId ?? `attendance-${Date.now()}`,
      notes: form.notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId !== null) {
      dispatch(updateAttendance(record));
      setSuccess("Attendance updated successfully.");
    } else {
      dispatch(addAttendance(record));
      setSuccess("Attendance marked successfully.");
    }

    setModalOpen(false);
    setEditingId(null);
  }

  function handleDelete(record) {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) return;

    dispatch(deleteAttendance(record.id));
    setSuccess("Attendance record deleted.");
  }

  function handlePayWages(worker) {
    if (!isAdmin) return;

    const [year, month] = selectedMonth.split("-").map(Number);

    const summary = calculateMonthlyWage(
      attendance,
      worker.id,
      worker.dailyWage,
      month - 1,
      year
    );

    if (summary.totalWage <= 0) {
      alert("No payable wages for this worker.");
      return;
    }

    const expenseId = `wage-${worker.id}-${selectedMonth}`;

    const alreadyPaid = expenses.some(
      (expense) => expense.id === expenseId
    );

    if (alreadyPaid) {
      alert("Wages for this worker have already been paid for this month.");
      return;
    }

    const confirmed = window.confirm(
      `Pay ${formatCurrency(summary.totalWage)} to ${worker.name}?`
    );

    if (!confirmed) return;

    dispatch(
      addExpense({
        id: expenseId,
        type: "Expense",
        cropId: null,
        category: "Labour Wages",
        amount: summary.totalWage,
        date: getLocalDate(),
        notes: `Worker: ${worker.name} | Worker ID: ${worker.id} | Month: ${selectedMonth} | Payable days: ${summary.payableDays}`,
      })
    );

    setSuccess(`Wages paid successfully to ${worker.name}.`);
  }

  return (
    <section className="attendance-page">

      <div className="attendance-heading">
        <div>
          <span className="attendance-eyebrow">
            WORKFORCE MANAGEMENT
          </span>

          <h2>Attendance & Payroll</h2>

          <p>
            Track daily attendance, calculate monthly wages and manage
            labour payments.
          </p>
        </div>

        <button
          className="attendance-primary-button"
          onClick={openAddModal}
          disabled={activeWorkers.length === 0}
        >
          <Plus size={18} />
          Mark Attendance
        </button>
      </div>

      {success && (
        <div className="attendance-success">
          {success}
        </div>
      )}

      {absentPercentage > 30 && (
        <div className="attendance-alert">
          <AlertTriangle size={20} />
          <span>
            Warning: More than 30% of active workers are absent on{" "}
            {selectedDate}.
          </span>
        </div>
      )}

      {/* Daily Summary */}

      <div className="attendance-summary">

        <article className="attendance-summary-card">
          <Users size={23} />
          <p>Active Workers</p>
          <h3>{activeWorkers.length}</h3>
        </article>

        <article className="attendance-summary-card">
          <ClipboardCheck size={23} />
          <p>Present Today</p>
          <h3>{presentToday}</h3>
        </article>

        <article className="attendance-summary-card">
          <CalendarDays size={23} />
          <p>Absent Today</p>
          <h3>{absentToday}</h3>
        </article>

        <article className="attendance-summary-card">
          <Wallet size={23} />
          <p>Monthly Wages</p>
          <h3>{formatCurrency(monthlyWages)}</h3>
        </article>

      </div>

      {/* Date Selection */}

      <div className="attendance-panel">
        <div className="attendance-section-heading">
          <div>
            <span className="attendance-eyebrow">
              DAILY RECORDS
            </span>

            <h3>Attendance Overview</h3>
          </div>

          <CalendarDays size={23} />
        </div>

        <div className="attendance-filter">
          <label>
            Select date

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>

          <div className="attendance-mini-stats">
            <span>Present: {presentToday}</span>
            <span>Absent: {absentToday}</span>
            <span>Half-day: {halfDayToday}</span>
          </div>
        </div>
      </div>

      {/* Monthly Attendance */}

      <div className="attendance-panel">

        <div className="attendance-section-heading">
          <div>
            <span className="attendance-eyebrow">
              ATTENDANCE HISTORY
            </span>

            <h3>Monthly Attendance Records</h3>
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
        </div>

        {sortedRecords.length > 0 ? (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedRecords.map((record) => {
                  const worker = workers.find(
  (item) => String(item.id) === String(record.workerId)
);

                  return (
                    <tr key={record.id}>
                      <td>{worker?.name || "Worker unavailable"}</td>

                      <td>{record.date}</td>

                      <td>
                        <span
                          className={`attendance-badge attendance-${record.status
                            .toLowerCase()
                            .replace("-", "")}`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td>{record.notes || "—"}</td>

                      <td>
                        {isAdmin ? (
                          <div className="attendance-actions">
                            <button
                              onClick={() => openEditModal(record)}
                              aria-label="Edit attendance"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(record)}
                              aria-label="Delete attendance"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          "View only"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="attendance-empty">
            No attendance records found for this month.
          </div>
        )}

      </div>

      {/* Monthly Payroll */}

      <div className="attendance-panel">

        <div className="attendance-section-heading">
          <div>
            <span className="attendance-eyebrow">
              PAYROLL MANAGEMENT
            </span>

            <h3>Monthly Worker Wages</h3>
          </div>

          <IndianRupee size={23} />
        </div>

        <div className="attendance-payroll-grid">

          {activeWorkers.map((worker) => {
            const [year, month] = selectedMonth.split("-").map(Number);

            const summary = calculateMonthlyWage(
              attendance,
              worker.id,
              worker.dailyWage,
              month - 1,
              year
            );

            const paid = expenses.some(
              (expense) =>
                expense.id === `wage-${worker.id}-${selectedMonth}`
            );

            return (
              <article
                className="attendance-payroll-card"
                key={worker.id}
              >
                <h4>{worker.name}</h4>

                <p>{worker.role}</p>

                <div>
                  <span>Present days</span>
                  <strong>{summary.presentDays}</strong>
                </div>

                <div>
                  <span>Half days</span>
                  <strong>{summary.halfDays}</strong>
                </div>

                <div>
                  <span>Absent days</span>
                  <strong>{summary.absentDays}</strong>
                </div>

                <div>
                  <span>Payable days</span>
                  <strong>{summary.payableDays}</strong>
                </div>

                <div className="attendance-wage-total">
                  <span>Total wages</span>
                  <strong>{formatCurrency(summary.totalWage)}</strong>
                </div>

                {isAdmin && (
                  <button
                    className="attendance-pay-button"
                    disabled={paid || summary.totalWage <= 0}
                    onClick={() => handlePayWages(worker)}
                  >
                    {paid ? "Already Paid" : "Pay Wages"}
                  </button>
                )}
              </article>
            );
          })}

          {activeWorkers.length === 0 && (
            <div className="attendance-empty">
              Register active workers to calculate wages.
            </div>
          )}

        </div>
      </div>

      {/* Attendance Modal */}

      {modalOpen && (
        <div className="attendance-modal-backdrop">

          <section className="attendance-modal">

            <div className="attendance-modal-heading">
              <h3>
                {editingId ? "Edit Attendance" : "Mark Attendance"}
              </h3>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>
                Select Worker

                <select
                  value={form.workerId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      workerId: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Choose worker</option>

                  {activeWorkers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Attendance Date

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      date: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Attendance Status

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value,
                    })
                  }
                >
                  {ATTENDANCE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Notes (Optional)

                <textarea
                  rows="3"
                  value={form.notes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      notes: event.target.value,
                    })
                  }
                  placeholder="Additional attendance details..."
                />
              </label>

              {error && (
                <p className="attendance-error">{error}</p>
              )}

              <div className="attendance-modal-actions">

                <button
                  type="button"
                  className="attendance-cancel-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="attendance-primary-button"
                >
                  Save Attendance
                </button>

              </div>

            </form>

          </section>
        </div>
      )}

    </section>
  );
}

export default Attendance;