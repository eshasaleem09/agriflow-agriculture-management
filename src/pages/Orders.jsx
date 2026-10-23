import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
ShoppingCart,
Search,
PackageCheck,
Clock3,
Truck,
Trash2,
ArrowUpDown,
ArrowUpRight,
Leaf,
CircleCheck,
SlidersHorizontal,
ClipboardList,
} from "lucide-react";

import {
  updateOrder,
  selectOrders,
} from "../features/harvest/harvestSlice.js";

import {
  deleteOrderWithStock,
} from "../features/harvest/harvestThunks.js";

function Orders() {
const dispatch = useDispatch();
const orders = useSelector(selectOrders);

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [sortNewestFirst, setSortNewestFirst] = useState(true);

const filteredOrders = useMemo(() => {
const query = search.trim().toLowerCase();

return [...orders]
  .filter((order) => {
    const matchesSearch =
      !query ||
      String(order.id).toLowerCase().includes(query) ||
      String(order.customer).toLowerCase().includes(query) ||
      String(order.crop).toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    return sortNewestFirst ? dateB - dateA : dateA - dateB;
  });

}, [orders, search, statusFilter, sortNewestFirst]);

const pendingCount = orders.filter(
(order) => order.status === "Pending"
).length;

const processingCount = orders.filter(
(order) => order.status === "Processing"
).length;

const deliveredCount = orders.filter(
(order) => order.status === "Delivered"
).length;

const completedPercentage = orders.length
? Math.round((deliveredCount / orders.length) * 100)
: 0;

function handleStatusChange(order, status) {
dispatch(updateOrder({ ...order, status }));
}

function handleDelete(order) {
  const confirmed = window.confirm(
    `Are you sure you want to delete order ${order.id}?`
  );

  if (!confirmed) return;

  const result = dispatch(deleteOrderWithStock(order.id));

  if (!result.ok) {
    window.alert(result.message);
  }
}

function getStatusClass(status) {
return String(status || "").toLowerCase();
}

return ( <main className="page-content orders-page"> <header className="orders-page-heading"> <div className="orders-heading-copy"> <div className="orders-breadcrumb"> <Leaf size={15} /> <span>AGRIFLOW</span> <span className="orders-breadcrumb-divider">/</span> <span>SALES MANAGEMENT</span> </div>

      <h1>
        Customer <span>Orders</span>
      </h1>

      <p className="orders-description">
        Keep every order on track, manage fulfillment, and stay on top
        of your farm's sales operations.
      </p>
    </div>

    <div className="orders-heading-decoration">
      <div className="orders-heading-decoration-inner">
        <ShoppingCart size={29} strokeWidth={1.7} />
      </div>
      <span className="orders-heading-decoration-dot" />
    </div>
  </header>

  <section className="orders-summary-grid" aria-label="Order statistics">
    <article className="orders-summary-card orders-total-card">
      <div className="orders-card-top">
        <div className="orders-summary-icon total-icon">
          <ShoppingCart size={20} />
        </div>
        <span className="orders-card-label">ALL ORDERS</span>
      </div>

      <div className="orders-card-value-row">
        <h2>{orders.length.toLocaleString()}</h2>
        <span className="orders-card-indicator">
          <ArrowUpRight size={15} />
        </span>
      </div>

      <p className="orders-card-description">Total recorded orders</p>

      <div className="orders-card-bottom-line">
        <span />
      </div>
    </article>

    <article className="orders-summary-card">
      <div className="orders-card-top">
        <div className="orders-summary-icon pending-icon">
          <Clock3 size={20} />
        </div>
        <span className="orders-card-label">NEEDS ATTENTION</span>
      </div>

      <div className="orders-card-value-row">
        <h2>{pendingCount.toLocaleString()}</h2>
        <span className="orders-status-dot pending-dot" />
      </div>

      <p className="orders-card-description">Awaiting processing</p>

      <div className="orders-card-bottom-line pending-line">
        <span />
      </div>
    </article>

    <article className="orders-summary-card">
      <div className="orders-card-top">
        <div className="orders-summary-icon processing-icon">
          <Truck size={20} />
        </div>
        <span className="orders-card-label">IN PROGRESS</span>
      </div>

      <div className="orders-card-value-row">
        <h2>{processingCount.toLocaleString()}</h2>
        <span className="orders-status-dot processing-dot" />
      </div>

      <p className="orders-card-description">Being prepared for delivery</p>

      <div className="orders-card-bottom-line processing-line">
        <span />
      </div>
    </article>

    <article className="orders-summary-card">
      <div className="orders-card-top">
        <div className="orders-summary-icon delivered-icon">
          <PackageCheck size={20} />
        </div>
        <span className="orders-card-label">COMPLETED</span>
      </div>

      <div className="orders-card-value-row">
        <h2>{deliveredCount.toLocaleString()}</h2>
        <span className="orders-completion-rate">
          {completedPercentage}%
        </span>
      </div>

      <p className="orders-card-description">Successfully delivered</p>

      <div className="orders-card-bottom-line delivered-line">
        <span />
      </div>
    </article>
  </section>

  <section className="orders-panel">
    <div className="orders-panel-heading">
      <div className="orders-panel-title-group">
        <div className="orders-panel-title-icon">
          <ClipboardList size={21} />
        </div>

        <div>
          <h2>Order management</h2>
          <p>Review customer purchases and manage order fulfillment.</p>
        </div>
      </div>

      <div className="orders-record-count">
        <span className="orders-record-count-dot" />
        {filteredOrders.length}{" "}
        {filteredOrders.length === 1 ? "order" : "orders"}
      </div>
    </div>

    <div className="orders-toolbar">
      <label className="orders-search">
        <Search size={18} />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order, customer or crop..."
          aria-label="Search orders"
        />

        {search && (
          <button
            type="button"
            className="orders-clear-search"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </label>

      <div className="orders-filter-group">
        <SlidersHorizontal size={16} />

        <select
          className="orders-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter orders by status"
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      <button
        type="button"
        className="orders-sort-button"
        onClick={() => setSortNewestFirst((current) => !current)}
      >
        <ArrowUpDown size={16} />
        {sortNewestFirst ? "Newest first" : "Oldest first"}
      </button>
    </div>

    <div className="orders-table-wrapper">
      <table className="orders-table">
        <thead>
          <tr>
            <th>ORDER DETAILS</th>
            <th>CUSTOMER</th>
            <th>PRODUCT</th>
            <th>QUANTITY</th>
            <th>STATUS</th>
            <th>UPDATE STATUS</th>
            <th className="orders-actions-heading">ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>
                <div className="orders-id-cell">
                  <div className="orders-id-icon">
                    <ShoppingCart size={16} />
                  </div>

                  <div>
                    <span className="orders-id">{order.id}</span>
                    <span className="orders-id-caption">
                      Customer order
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <div className="orders-customer-cell">
                  <span className="orders-customer-avatar">
                    {String(order.customer || "C")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <span className="orders-customer-name">
                    {order.customer || "Unknown customer"}
                  </span>
                </div>
              </td>

              <td>
                <div className="orders-product-cell">
                  <span className="orders-product-icon">
                    <Leaf size={16} />
                  </span>
                  <span>{order.crop || "Unspecified crop"}</span>
                </div>
              </td>

              <td>
                <span className="orders-quantity">
                  {Number(order.quantity || 0).toLocaleString()}
                  <span> kg</span>
                </span>
              </td>

              <td>
                <span
                  className={`orders-status ${getStatusClass(order.status)}`}
                >
                  <span className="orders-status-dot" />
                  {order.status || "Pending"}
                </span>
              </td>

              <td>
                <select
                  className="orders-status-select"
                  value={order.status || "Pending"}
                  onChange={(event) =>
                    handleStatusChange(order, event.target.value)
                  }
                  aria-label={`Update ${order.id} status`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </td>

              <td className="orders-actions-cell">
                <button
                  type="button"
                  className="orders-delete-button"
                  onClick={() => handleDelete(order)}
                  title="Delete order"
                  aria-label={`Delete ${order.id}`}
                >
                  <Trash2 size={17} />
                </button>
              </td>
            </tr>
          ))}

          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan={7} className="orders-empty">
                <div className="orders-empty-content">
                  <div className="orders-empty-icon">
                    <Search size={23} />
                  </div>
                  <h3>No orders found</h3>
                  <p>
                    Try changing your search or selecting a different
                    status filter.
                  </p>

                  {(search || statusFilter !== "All") && (
                    <button
                      type="button"
                      className="orders-reset-button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("All");
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <footer className="orders-panel-footer">
      <div className="orders-footer-note">
        <CircleCheck size={16} />
        <span>Connected to your shared order management store</span>
      </div>

      <span className="orders-footer-total">
        Showing {filteredOrders.length} of {orders.length} orders
      </span>
    </footer>
  </section>
</main>

);
}

export default Orders;
