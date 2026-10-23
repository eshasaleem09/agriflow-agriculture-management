import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
CalendarDays,
CheckCircle2,
Clock,
Plus,
Trash2,
Wheat,
ShoppingCart,
Package,
X,
} from "lucide-react";

import {
  addHarvest,
  deleteHarvest,
  completeHarvest,
  updateOrder,
  selectHarvestSchedule,
  selectOrders,
} from "../features/harvest/harvestSlice.js";

import {
  createOrderWithStock,
  deleteOrderWithStock,
} from "../features/harvest/harvestThunks.js";

import { updateCrop } from "../features/crops/cropsSlice.js";

function HarvestOrders() {
const dispatch = useDispatch();

const crops = useSelector((state) => state.crops);
const buyers = useSelector((state) => state.buyers);
const schedule = useSelector(selectHarvestSchedule);
const orders = useSelector(selectOrders);

const [showHarvestForm, setShowHarvestForm] = useState(false);
const [showOrderForm, setShowOrderForm] = useState(false);

const [harvestForm, setHarvestForm] = useState({
cropName: "",
field: "",
plannedDate: "",
quantity: "",
});

const [orderForm, setOrderForm] = useState({
customer: "",
crop: "",
quantity: "",
});

const [message, setMessage] = useState("");
const [error, setError] = useState("");

const totalHarvest = useMemo(
() =>
schedule
.filter((item) => item.status === "Completed")
.reduce((total, item) => total + Number(item.quantity || 0), 0),
[schedule]
);

const totalSold = useMemo(
() =>
buyers.reduce(
(total, buyer) => total + Number(buyer.quantity || 0),
0
),
[buyers]
);

const remainingStock = useMemo(
() =>
crops.reduce(
(total, crop) => total + Number(crop.quantity || 0),
0
),
[crops]
);

const totalOrders = orders.length;

function handleHarvestSubmit(event) {
event.preventDefault();
setMessage("");
setError("");

const quantity = Number(harvestForm.quantity);

if (
  !harvestForm.cropName ||
  !harvestForm.field.trim() ||
  !harvestForm.plannedDate ||
  !Number.isFinite(quantity) ||
  quantity <= 0
) {
  setError("Please complete all harvest fields with valid values.");
  return;
}

const selectedCrop = crops.find(
  (crop) => crop.name === harvestForm.cropName
);

if (!selectedCrop) {
  setError("The selected crop could not be found.");
  return;
}

const harvestRecord = {
  id: Date.now(),
  cropName: harvestForm.cropName,
  field: harvestForm.field.trim(),
  plannedDate: harvestForm.plannedDate,
  quantity,
  status: "Planned",
};

dispatch(addHarvest(harvestRecord));
setHarvestForm({
  cropName: "",
  field: "",
  plannedDate: "",
  quantity: "",
});
setShowHarvestForm(false);
setMessage("Harvest schedule added successfully.");

}

function handleCompleteHarvest(item) {
setMessage("");
setError("");

if (item.status === "Completed") {
  setError("This harvest has already been completed.");
  return;
}

const selectedCrop = crops.find(
  (crop) => crop.name === item.cropName
);

if (!selectedCrop) {
  setError("The related crop could not be found.");
  return;
}

dispatch(completeHarvest(item.id));

dispatch(
  updateCrop({
    ...selectedCrop,
    quantity: Number(selectedCrop.quantity || 0) + Number(item.quantity),
  })
);

setMessage(`${item.cropName} harvest marked as completed.`)

}

function handleOrderSubmit(event) {
event.preventDefault();
setMessage("");
setError("");

const quantity = Number(orderForm.quantity);

if (
  !orderForm.customer.trim() ||
  !orderForm.crop ||
  !Number.isFinite(quantity) ||
  quantity <= 0
) {
  setError("Enter a customer, crop, and valid quantity.");
  return;
}

const selectedCrop = crops.find(
  (crop) => crop.name === orderForm.crop
);

if (!selectedCrop) {
  setError("The selected crop could not be found.");
  return;
}

if (quantity > Number(selectedCrop.quantity || 0)) {
  setError(
    `Insufficient ${selectedCrop.name} stock. Available: ${selectedCrop.quantity}.`
  );
  return;
}

const order = {
  id: `ORD-${Date.now()}`,
  customer: orderForm.customer.trim(),
  crop: orderForm.crop,
  quantity,
  status: "Pending",
  createdAt: new Date().toISOString(),
};

const result = dispatch(createOrderWithStock(order));

if (!result.ok) {
  setError(result.message);
  return;
}

setOrderForm({
  customer: "",
  crop: "",
  quantity: "",
});

setShowOrderForm(false);
setMessage(result.message);

}

function handleOrderStatusChange(order, status) {
dispatch(updateOrder({ ...order, status }));
setMessage(`${order.id} status updated to ${status}.`);
setError("");
}
function handleDeleteOrder(order) {
  const confirmed = window.confirm(
    `Delete ${order.id}? Any explicitly allocated crop stock will be restored.`
  );

  if (!confirmed) return;

  const result = dispatch(deleteOrderWithStock(order.id));

  if (!result.ok) {
    setError(result.message);
    return;
  }

  setMessage(result.message);
  setError("");
}


function handleDeleteHarvest(item) {
const confirmed = window.confirm(
`Delete the ${item.cropName} harvest schedule?`
);

if (!confirmed) return;

dispatch(deleteHarvest(item.id));
setMessage("Harvest schedule deleted.");
setError("");

}

return ( <main className="page-content harvest-page"> <div className="page-heading"> <div> <p className="eyebrow">FARM OPERATIONS</p> <h1>Harvest & Orders</h1> <p className="page-description">
Schedule harvests, manage customer orders, and monitor available
crop stock. </p> </div> </div>

  {message && (
    <div className="harvest-notice success" role="status">
      <CheckCircle2 size={18} />
      <span>{message}</span>
      <button
        type="button"
        aria-label="Dismiss success message"
        onClick={() => setMessage("")}
      >
        <X size={16} />
      </button>
    </div>
  )}

  {error && (
    <div className="harvest-notice error" role="alert">
      <span>{error}</span>
      <button
        type="button"
        aria-label="Dismiss error message"
        onClick={() => setError("")}
      >
        <X size={16} />
      </button>
    </div>
  )}

  <section className="harvest-summary-grid">
    <article className="harvest-summary-card">
      <div className="harvest-summary-icon">
        <Wheat size={22} />
      </div>
      <p>Completed Harvest</p>
      <h2>{totalHarvest.toLocaleString()} kg</h2>
      <span>Recorded completed harvests</span>
    </article>

    <article className="harvest-summary-card">
      <div className="harvest-summary-icon">
        <ShoppingCart size={22} />
      </div>
      <p>Total Orders</p>
      <h2>{totalOrders}</h2>
      <span>Orders in the system</span>
    </article>

    <article className="harvest-summary-card">
      <div className="harvest-summary-icon">
        <Package size={22} />
      </div>
      <p>Available Crop Stock</p>
      <h2>{remainingStock.toLocaleString()} kg</h2>
      <span>Current quantity across crops</span>
    </article>

    <article className="harvest-summary-card">
      <div className="harvest-summary-icon">
        <CheckCircle2 size={22} />
      </div>
      <p>Buyer Purchases</p>
      <h2>{totalSold.toLocaleString()} kg</h2>
      <span>Quantities recorded by Buyers</span>
    </article>
  </section>

  <section className="harvest-panel">
    <div className="harvest-panel-heading">
      <div>
        <h2>Harvest Schedule</h2>
        <p>Plan harvests and record completed farm work.</p>
      </div>

      <button
        type="button"
        className="harvest-primary-button"
        onClick={() => {
          setShowHarvestForm((current) => !current);
          setError("");
        }}
      >
        <Plus size={17} />
        Schedule Harvest
      </button>
    </div>

    {showHarvestForm && (
      <form
        className="harvest-form"
        onSubmit={handleHarvestSubmit}
      >
        <label>
          Crop
          <select
            value={harvestForm.cropName}
            onChange={(event) =>
              setHarvestForm({
                ...harvestForm,
                cropName: event.target.value,
              })
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
          Field
          <input
            value={harvestForm.field}
            onChange={(event) =>
              setHarvestForm({
                ...harvestForm,
                field: event.target.value,
              })
            }
            placeholder="e.g. Field A"
            required
          />
        </label>

        <label>
          Planned Date
          <input
            type="date"
            value={harvestForm.plannedDate}
            onChange={(event) =>
              setHarvestForm({
                ...harvestForm,
                plannedDate: event.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Quantity (kg)
          <input
            type="number"
            min="1"
            step="any"
            value={harvestForm.quantity}
            onChange={(event) =>
              setHarvestForm({
                ...harvestForm,
                quantity: event.target.value,
              })
            }
            placeholder="e.g. 500"
            required
          />
        </label>

        <div className="harvest-form-actions">
          <button type="submit" className="harvest-primary-button">
            Save Schedule
          </button>
          <button
            type="button"
            className="harvest-secondary-button"
            onClick={() => setShowHarvestForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    )}

    <div className="harvest-table-wrapper">
      <table className="harvest-table">
        <thead>
          <tr>
            <th>Crop</th>
            <th>Field</th>
            <th>Planned Date</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item) => (
            <tr key={item.id}>
              <td>{item.cropName}</td>
              <td>{item.field}</td>
              <td>{item.plannedDate}</td>
              <td>{Number(item.quantity).toLocaleString()} kg</td>
              <td>
                <span
                  className={`harvest-status ${
                    item.status === "Completed"
                      ? "completed"
                      : "planned"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td>
                <div className="harvest-row-actions">
                  {item.status !== "Completed" && (
                    <button
                      type="button"
                      className="harvest-icon-button"
                      title="Mark completed"
                      aria-label={`Complete ${item.cropName} harvest`}
                      onClick={() => handleCompleteHarvest(item)}
                    >
                      <CheckCircle2 size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="harvest-icon-button danger"
                    title="Delete schedule"
                    aria-label={`Delete ${item.cropName} harvest schedule`}
                    onClick={() => handleDeleteHarvest(item)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {schedule.length === 0 && (
            <tr>
              <td colSpan="6" className="harvest-empty">
                No harvest schedules yet. Add your first schedule above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>

  <section className="harvest-panel">
    <div className="harvest-panel-heading">
      <div>
        <h2>Customer Orders</h2>
        <p>Manage orders and keep track of their delivery status.</p>
      </div>

      <button
        type="button"
        className="harvest-primary-button"
        onClick={() => {
          setShowOrderForm((current) => !current);
          setError("");
        }}
      >
        <Plus size={17} />
        Create Order
      </button>
    </div>

    {showOrderForm && (
      <form className="harvest-form" onSubmit={handleOrderSubmit}>
        <label>
          Customer Name
          <input
            value={orderForm.customer}
            onChange={(event) =>
              setOrderForm({
                ...orderForm,
                customer: event.target.value,
              })
            }
            placeholder="Enter customer name"
            required
          />
        </label>

        <label>
          Crop
          <select
            value={orderForm.crop}
            onChange={(event) =>
              setOrderForm({
                ...orderForm,
                crop: event.target.value,
              })
            }
            required
          >
            <option value="">Select crop</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.name}>
                {crop.name} — {crop.quantity} kg available
              </option>
            ))}
          </select>
        </label>

        <label>
          Quantity (kg)
          <input
            type="number"
            min="1"
            step="any"
            value={orderForm.quantity}
            onChange={(event) =>
              setOrderForm({
                ...orderForm,
                quantity: event.target.value,
              })
            }
            placeholder="Enter quantity"
            required
          />
        </label>

        <div className="harvest-form-actions">
          <button type="submit" className="harvest-primary-button">
            Save Order
          </button>
          <button
            type="button"
            className="harvest-secondary-button"
            onClick={() => setShowOrderForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    )}

    <div className="harvest-table-wrapper">
      <table className="harvest-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Crop</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Update Status</th>
            <th>Actions</th>
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
                  className={`harvest-status ${String(
                    order.status
                  ).toLowerCase()}`}
                >
                  {order.status}
                </span>
              </td>
              <td>
                <select
                  className="harvest-status-select"
                  value={order.status}
                  onChange={(event) =>
                    handleOrderStatusChange(order, event.target.value)
                  }
                  aria-label={`Update status for ${order.id}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </td>
              <td>
                <button
                  type="button"
                  className="harvest-icon-button danger"
                  title="Delete order"
                  aria-label={`Delete order ${order.id}`}
                  onClick={() => handleDeleteOrder(order)}
                >
                  <Trash2 size={17} />
                </button>
              </td>
            </tr>
          ))}

          {orders.length === 0 && (
            <tr>
              <td colSpan="7" className="harvest-empty">
                No orders yet. Create your first customer order above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>

  <section className="harvest-panel">
    <div className="harvest-panel-heading">
      <div>
        <h2>Buyer Purchase Records</h2>
        <p>Purchases entered through the Buyers page.</p>
      </div>
      <Clock size={21} />
    </div>

    <div className="harvest-table-wrapper">
      <table className="harvest-table">
        <thead>
          <tr>
            <th>Buyer</th>
            <th>Crop</th>
            <th>Quantity</th>
            <th>Purchase Date</th>
          </tr>
        </thead>
        <tbody>
          {buyers.map((buyer) => (
            <tr key={buyer.id}>
              <td>{buyer.name}</td>
              <td>{buyer.cropName}</td>
              <td>{Number(buyer.quantity).toLocaleString()} kg</td>
              <td>{buyer.purchaseDate || "—"}</td>
            </tr>
          ))}

          {buyers.length === 0 && (
            <tr>
              <td colSpan="4" className="harvest-empty">
                Buyer purchase records will appear here when added from
                the Buyers page.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
</main>

);
}

export default HarvestOrders;
