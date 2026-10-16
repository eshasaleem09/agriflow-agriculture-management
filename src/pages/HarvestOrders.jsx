import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Wheat,
  ShoppingBag,
  PackageCheck,
  Plus,
  Trash2,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const CROPS_KEY = "agriflow-crops";
const BUYERS_KEY = "agriflow-buyers";
const HARVEST_KEY = "agriflow-harvest-schedule";
const ORDERS_KEY = "agriflow-orders";

const initialSchedule = [
  {
    id: 1,
    cropName: "Wheat",
    field: "Field A",
    plannedDate: "2026-10-18",
    quantity: 1000,
    status: "Planned",
  },
  {
    id: 2,
    cropName: "Rice",
    field: "Field B",
    plannedDate: "2026-10-20",
    quantity: 1500,
    status: "Planned",
  },
  {
    id: 3,
    cropName: "Corn",
    field: "Field C",
    plannedDate: "2026-10-12",
    quantity: 800,
    status: "Completed",
  },
];

const initialOrders = [
  {
    id: "ORD-1024",
    customer: "Ahmed Khan",
    crop: "Wheat",
    quantity: 500,
    status: "Delivered",
  },
  {
    id: "ORD-1025",
    customer: "Fatima Ali",
    crop: "Rice",
    quantity: 300,
    status: "Pending",
  },
  {
    id: "ORD-1026",
    customer: "Usman Malik",
    crop: "Corn",
    quantity: 200,
    status: "Processing",
  },
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function getDaysRemaining(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${date}T00:00:00`);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-PK",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function HarvestOrders() {
  const [crops, setCrops] = useState(() =>
    readStorage(CROPS_KEY, [])
  );

  const [buyers, setBuyers] = useState(() =>
    readStorage(BUYERS_KEY, [])
  );

  const [schedule, setSchedule] = useState(() =>
    readStorage(HARVEST_KEY, initialSchedule)
  );

  const [orders, setOrders] = useState(() =>
    readStorage(ORDERS_KEY, initialOrders)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    cropName: "",
    field: "",
    plannedDate: "",
    quantity: "",
  });

  useEffect(() => {
    localStorage.setItem(HARVEST_KEY, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const totalHarvest = schedule
    .filter((item) => item.status === "Completed")
    .reduce((sum, item) => sum + Number(item.quantity), 0);

  const totalSold = buyers.reduce(
    (sum, buyer) => sum + Number(buyer.quantity || 0),
    0
  );

  const totalOrders = orders.length;

  const remainingStock = crops.reduce(
    (sum, crop) => sum + Number(crop.quantity || 0),
    0
  );

  const upcoming = useMemo(
    () =>
      [...schedule].sort(
        (a, b) =>
          new Date(a.plannedDate) - new Date(b.plannedDate)
      ),
    [schedule]
  );

  function openModal() {
    const freshCrops = readStorage(CROPS_KEY, []);
    setCrops(freshCrops);

    setForm({
      cropName: freshCrops[0]?.name || "",
      field: freshCrops[0]?.field || "",
      plannedDate: "",
      quantity: "",
    });

    setError("");
    setModalOpen(true);
  }

  function handleCropChange(name) {
    const crop = crops.find((item) => item.name === name);

    setForm((current) => ({
      ...current,
      cropName: name,
      field: crop?.field || "",
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const crop = crops.find(
      (item) => item.name === form.cropName
    );

    const quantity = Number(form.quantity);

    if (!crop) {
      setError("Please select a valid crop.");
      return;
    }

    if (!form.field.trim() || !form.plannedDate) {
      setError("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }

    const entry = {
      id: Date.now(),
      cropName: crop.name,
      field: form.field.trim(),
      plannedDate: form.plannedDate,
      quantity,
      status: "Planned",
    };

    setSchedule((current) => [...current, entry]);
    setModalOpen(false);
    setError("");
  }

  function deleteSchedule(id) {
    if (
      window.confirm(
        "Are you sure you want to delete this harvest schedule?"
      )
    ) {
      setSchedule((current) =>
        current.filter((item) => item.id !== id)
      );
    }
  }

  function completeHarvest(item) {
    const crop = crops.find(
      (record) => record.name === item.cropName
    );

    if (!crop) {
      window.alert(
        "This crop no longer exists in Crop Management."
      );
      return;
    }

    const alreadyCompleted = item.status === "Completed";

    if (alreadyCompleted) return;

    const updatedCrops = crops.map((record) =>
      record.id === crop.id
        ? {
            ...record,
            quantity: Number(record.quantity) + Number(item.quantity),
          }
        : record
    );

    const updatedSchedule = schedule.map((record) =>
      record.id === item.id
        ? { ...record, status: "Completed" }
        : record
    );

    localStorage.setItem(
      CROPS_KEY,
      JSON.stringify(updatedCrops)
    );

    setCrops(updatedCrops);
    setSchedule(updatedSchedule);
  }

  return (
    <section className="harvest-page">
      <div className="harvest-heading">
        <div>
          <span className="harvest-eyebrow">FARM OPERATIONS</span>
          <h2>Harvest & Orders</h2>
          <p>
            Track harvest schedules, completed harvests, crop sales,
            and available stock.
          </p>
        </div>

        <button
          type="button"
          className="harvest-primary-button"
          onClick={openModal}
        >
          <Plus size={18} />
          Schedule Harvest
        </button>
      </div>

      <div className="harvest-summary-grid">
        <article className="panel harvest-summary-card">
          <span><Wheat size={22} /></span>
          <div>
            <p>Total Harvested</p>
            <h3>{totalHarvest.toLocaleString()} kg</h3>
          </div>
        </article>

        <article className="panel harvest-summary-card">
          <span><ShoppingBag size={22} /></span>
          <div>
            <p>Orders Received</p>
            <h3>{totalOrders}</h3>
          </div>
        </article>

        <article className="panel harvest-summary-card">
          <span><PackageCheck size={22} /></span>
          <div>
            <p>Quantity Sold</p>
            <h3>{totalSold.toLocaleString()} kg</h3>
          </div>
        </article>

        <article className="panel harvest-summary-card">
          <span><Wheat size={22} /></span>
          <div>
            <p>Available Stock</p>
            <h3>{remainingStock.toLocaleString()} kg</h3>
          </div>
        </article>
      </div>

      <div className="harvest-section-heading">
        <div>
          <h3>Harvest & Cutting Schedule</h3>
          <p>Monitor planned dates and completed farm activities.</p>
        </div>
      </div>

      <div className="harvest-schedule-list">
        {upcoming.map((item) => {
          const days = getDaysRemaining(item.plannedDate);
          const completed = item.status === "Completed";

          let label = "";

          if (completed) {
            label = "Completed";
          } else if (days < 0) {
            label = `${Math.abs(days)} day(s) overdue`;
          } else if (days === 0) {
            label = "Due today";
          } else {
            label = `${days} day(s) remaining`;
          }

          const urgency = completed
            ? "harvest-completed"
            : days < 0
              ? "harvest-overdue"
              : days <= 3
                ? "harvest-due"
                : "harvest-upcoming";

          return (
            <article
              className={`panel harvest-schedule-card ${urgency}`}
              key={item.id}
            >
              <div className="harvest-date-icon">
                {completed ? (
                  <CheckCircle2 size={23} />
                ) : days < 0 ? (
                  <AlertTriangle size={23} />
                ) : (
                  <CalendarDays size={23} />
                )}
              </div>

              <div className="harvest-schedule-details">
                <h4>{item.cropName}</h4>
                <p>{item.field}</p>
                <span>
                  <CalendarDays size={14} />
                  {formatDate(item.plannedDate)}
                </span>
              </div>

              <div className="harvest-schedule-quantity">
                <strong>
                  {Number(item.quantity).toLocaleString()} kg
                </strong>
                <span className={`harvest-status ${urgency}`}>
                  {label}
                </span>
              </div>

              <div className="harvest-card-actions">
                {!completed && (
                  <button
                    type="button"
                    className="harvest-complete-button"
                    onClick={() => completeHarvest(item)}
                  >
                    Mark harvested
                  </button>
                )}

                <button
                  type="button"
                  className="harvest-delete-button"
                  onClick={() => deleteSchedule(item.id)}
                  aria-label={`Delete ${item.cropName} schedule`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="harvest-section-heading">
        <div>
          <h3>Customer Orders</h3>
          <p>Overview of existing customer orders and buyer purchases.</p>
        </div>
      </div>

      <div className="panel harvest-orders-table-wrapper">
        <table className="harvest-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Crop</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.crop}</td>
                <td>{Number(order.quantity).toLocaleString()} kg</td>
                <td>
                  <span
                    className={`harvest-order-status ${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="harvest-section-heading">
        <div>
          <h3>Buyer Purchases</h3>
          <p>Sales recorded through the Buyers page.</p>
        </div>
      </div>

      <div className="panel harvest-orders-table-wrapper">
        <table className="harvest-orders-table">
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Crop</th>
              <th>Quantity Sold</th>
              <th>Purchase Date</th>
            </tr>
          </thead>

          <tbody>
            {buyers.length === 0 ? (
              <tr>
                <td colSpan="4">No buyer purchases recorded yet.</td>
              </tr>
            ) : (
              buyers.map((buyer) => (
                <tr key={buyer.id}>
                  <td>{buyer.name}</td>
                  <td>{buyer.cropName}</td>
                  <td>{Number(buyer.quantity).toLocaleString()} kg</td>
                  <td>{buyer.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="harvest-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="harvest-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="harvest-modal-title"
          >
            <div className="harvest-modal-heading">
              <div>
                <span className="harvest-eyebrow">FARM PLANNING</span>
                <h3 id="harvest-modal-title">Schedule a Harvest</h3>
              </div>

              <button
                type="button"
                className="harvest-close-button"
                onClick={() => setModalOpen(false)}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="harvest-form"
              onSubmit={handleSubmit}
            >
              <label>
                Crop
                <select
                  value={form.cropName}
                  onChange={(event) =>
                    handleCropChange(event.target.value)
                  }
                  required
                >
                  <option value="">Select crop</option>
                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.name}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Field name
                <input
                  value={form.field}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      field: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Planned cutting date
                <input
                  type="date"
                  value={form.plannedDate}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      plannedDate: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Expected harvest quantity (kg)
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      quantity: event.target.value,
                    })
                  }
                  required
                />
              </label>

              {error && (
                <p className="harvest-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="harvest-form-actions">
                <button
                  type="button"
                  className="harvest-cancel-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="harvest-primary-button"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default HarvestOrders;