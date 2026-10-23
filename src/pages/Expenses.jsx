import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addExpense,
  updateExpense,
  deleteExpense,
} from "../features/expenses/expensesSlice.js";

import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  Sprout,
  ReceiptText,
} from "lucide-react";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Expenses() {
  const dispatch = useDispatch();

  const expenses = useSelector((state) => state.expenses);
  const crops = useSelector((state) => state.crops);
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === "Admin";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [error, setError] = useState("");

  const emptyForm = {
    type: "Expense",
    cropId: "",
    category: "",
    amount: "",
    date: getLocalDate(),
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const totalIncome = expenses
    .filter((item) => item.type === "Income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpenses = expenses
    .filter((item) => item.type === "Expense")
    .reduce((total, item) => total + item.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const crop = crops.find(
          (entry) => Number(entry.id) === Number(item.cropId)
        );

        const searchText = search.toLowerCase();

        const matchesSearch =
          item.category.toLowerCase().includes(searchText) ||
          (crop?.name || "").toLowerCase().includes(searchText) ||
          (item.notes || "").toLowerCase().includes(searchText);

        const matchesType =
          typeFilter === "All" || item.type === typeFilter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, crops, search, typeFilter]);

  // Calculate income, expenses and profit/loss per crop
  const cropFinances = useMemo(() => {
    return crops.map((crop) => {
      const records = expenses.filter(
        (item) => Number(item.cropId) === Number(crop.id)
      );

      const income = records
        .filter((item) => item.type === "Income")
        .reduce((total, item) => total + item.amount, 0);

      const cost = records
        .filter((item) => item.type === "Expense")
        .reduce((total, item) => total + item.amount, 0);

      return {
        id: crop.id,
        name: crop.name,
        income,
        expenses: cost,
        profit: income - cost,
      };
    });
  }, [crops, expenses]);

  function openAddModal() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      cropId: crops.length ? String(crops[0].id) : "",
      date: getLocalDate(),
    });

    setError("");
    setModalOpen(true);
  }

  function openEditModal(item) {
    if (!isAdmin) return;

    setEditingId(item.id);

    setForm({
      type: item.type,
      cropId: String(item.cropId),
      category: item.category,
      amount: String(item.amount),
      date: item.date,
      notes: item.notes || "",
    });

    setError("");
    setModalOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (editingId !== null && !isAdmin) {
      setError("Only an Admin can edit financial records.");
      return;
    }

    const category = form.category.trim();
    const amount = Number(form.amount);
    const cropId = Number(form.cropId);

    if (
      !category ||
      !form.cropId ||
      !form.date ||
      form.amount === ""
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    const linkedCrop = crops.find(
      (crop) => Number(crop.id) === cropId
    );

    if (!linkedCrop) {
      setError("Please select a valid crop.");
      return;
    }

    const record = {
      id: editingId ?? Date.now(),
      type: form.type,
      cropId,
      category,
      amount,
      date: form.date,
      notes: form.notes.trim(),
    };

    if (editingId !== null) {
      dispatch(updateExpense(record));
    } else {
      dispatch(addExpense(record));
    }

    setModalOpen(false);
    setForm(emptyForm);
    setError("");
  }

  function handleDelete(item) {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Delete this ${item.type.toLowerCase()} record?`
    );

    if (confirmed) {
      dispatch(deleteExpense(item.id));
    }
  }

  return (
    <section className="expenses-page">
      <div className="expenses-heading">
        <div>
          <span className="expenses-eyebrow">FARM FINANCE</span>

          <h2>Expenses & Profit/Loss</h2>

          <p>
            Track income and costs to understand the financial
            performance of your crops.
          </p>
        </div>

        <button
          type="button"
          className="expenses-primary-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Financial Record
        </button>
      </div>

      <div className="expenses-summary-grid">
        <article className="expenses-summary-card">
          <span className="expenses-summary-icon">
            <TrendingUp size={22} />
          </span>

          <p>Total Income</p>

          <h3>{formatCurrency(totalIncome)}</h3>
        </article>

        <article className="expenses-summary-card">
          <span className="expenses-summary-icon">
            <TrendingDown size={22} />
          </span>

          <p>Total Expenses</p>

          <h3>{formatCurrency(totalExpenses)}</h3>
        </article>

        <article className="expenses-summary-card">
          <span className="expenses-summary-icon">
            <Wallet size={22} />
          </span>

          <p>Net Profit / Loss</p>

          <h3 className={netProfit >= 0 ? "profit-positive" : "profit-negative"}>
            {formatCurrency(netProfit)}
          </h3>

          <span className="expenses-summary-caption">
            {netProfit >= 0 ? "Net profit" : "Net loss"}
          </span>
        </article>
      </div>

      <div className="crop-finances-section">
        <div className="expenses-section-heading">
          <div>
            <span className="expenses-eyebrow">CROP PERFORMANCE</span>
            <h3>Profit/Loss by Crop</h3>
          </div>

          <Sprout size={25} />
        </div>

        {cropFinances.length > 0 ? (
          <div className="crop-finances-grid">
            {cropFinances.map((crop) => (
              <article className="crop-finance-card" key={crop.id}>
                <div className="crop-finance-title">
                  <span className="crop-finance-icon">
                    <Sprout size={20} />
                  </span>

                  <h4>{crop.name}</h4>
                </div>

                <div className="crop-finance-row">
                  <span>Income</span>
                  <strong>{formatCurrency(crop.income)}</strong>
                </div>

                <div className="crop-finance-row">
                  <span>Expenses</span>
                  <strong>{formatCurrency(crop.expenses)}</strong>
                </div>

                <div className="crop-finance-result">
                  <span>
                    {crop.profit >= 0 ? "Profit" : "Loss"}
                  </span>

                  <strong
                    className={
                      crop.profit >= 0
                        ? "profit-positive"
                        : "profit-negative"
                    }
                  >
                    {formatCurrency(Math.abs(crop.profit))}
                    {crop.profit < 0 ? " loss" : ""}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="expenses-empty-message">
            Add a crop before creating financial records.
          </p>
        )}
      </div>

      <div className="expenses-records-section">
        <div className="expenses-section-heading">
          <div>
            <span className="expenses-eyebrow">TRANSACTIONS</span>
            <h3>Financial Records</h3>
          </div>

          <ReceiptText size={24} />
        </div>

        <div className="expenses-toolbar">
          <input
            type="search"
            placeholder="Search category, crop or notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search financial records"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter by record type"
          >
            <option value="All">All records</option>
            <option value="Income">Income only</option>
            <option value="Expense">Expenses only</option>
          </select>
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Crop</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((item) => {
                  const crop = crops.find(
                    (entry) =>
                      Number(entry.id) === Number(item.cropId)
                  );

                  return (
                    <tr key={item.id}>
                      <td>{item.date}</td>

                      <td>{crop?.name || "Crop unavailable"}</td>

                      <td>
                        <div>{item.category}</div>

                        {item.notes && (
                          <small className="expense-record-note">
                            {item.notes}
                          </small>
                        )}
                      </td>

                      <td>
                        <span
                          className={`expense-type-badge ${
                            item.type === "Income"
                              ? "expense-type-income"
                              : "expense-type-cost"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td
                        className={
                          item.type === "Income"
                            ? "profit-positive"
                            : "profit-negative"
                        }
                      >
                        {item.type === "Expense" ? "−" : "+"}
                        {formatCurrency(item.amount)}
                      </td>

                      <td>
                        {isAdmin ? (
                          <div className="expense-row-actions">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              aria-label={`Edit ${item.category}`}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              aria-label={`Delete ${item.category}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="expense-readonly">View only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="expenses-empty-message">
            <IndianRupee size={30} />

            <p>No financial records match your search.</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="expenses-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="expenses-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="expenses-modal-title"
          >
            <div className="expenses-modal-heading">
              <div>
                <span className="expenses-eyebrow">FARM FINANCE</span>

                <h3 id="expenses-modal-title">
                  {editingId !== null
                    ? "Edit Financial Record"
                    : "Add Financial Record"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close financial form"
              >
                <X size={20} />
              </button>
            </div>

            {crops.length === 0 ? (
              <p className="expense-form-error">
                Please add a crop before creating financial records.
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <label>
                  Record type

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </label>

                <label>
                  Linked crop

                  <select
                    value={form.cropId}
                    onChange={(event) =>
                      setForm({ ...form, cropId: event.target.value })
                    }
                    required
                  >
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name} — {crop.field}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Category

                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    placeholder={
                      form.type === "Income"
                        ? "e.g. Wheat sales"
                        : "e.g. Fertilizer purchase"
                    }
                    required
                  />
                </label>

                <label>
                  Amount (PKR)

                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    placeholder="Enter amount"
                    required
                  />
                </label>

                <label>
                  Date

                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Notes (optional)

                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={(event) =>
                      setForm({ ...form, notes: event.target.value })
                    }
                    placeholder="Additional details..."
                  />
                </label>

                {error && (
                  <p className="expense-form-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="expenses-modal-actions">
                  <button
                    type="button"
                    className="expenses-cancel-button"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="expenses-primary-button"
                  >
                    {editingId !== null ? "Save Changes" : "Save Record"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export default Expenses;