import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  Download,
  Printer,
  Wallet,
  TrendingUp,
  TrendingDown,
  Sprout,
  ClipboardList,
  Package,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getTaskStatus(task) {
  if (task.status === "Done") {
    return "Done";
  }

  const today = new Date().toISOString().slice(0, 10);

  return task.dueDate < today ? "Overdue" : "Pending";
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(rows, filename) {
  const csv = rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function Reports() {
  const crops = useSelector((state) => state.crops);
  const tasks = useSelector((state) => state.tasks);
  const inventory = useSelector((state) => state.inventory);
  const expenses = useSelector((state) => state.expenses);
  const activity = useSelector((state) => state.activity);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const monthlyExpenses = useMemo(
    () =>
      expenses.filter(
        (item) => item.date?.slice(0, 7) === selectedMonth
      ),
    [expenses, selectedMonth]
  );

  const monthlyTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.dueDate?.slice(0, 7) === selectedMonth
      ),
    [tasks, selectedMonth]
  );

  const monthlyActivity = useMemo(
    () =>
      activity.filter(
        (item) =>
          item.timestamp &&
          new Date(item.timestamp).toLocaleDateString("en-CA", {
            timeZone: "Asia/Karachi",
          }).slice(0, 7) === selectedMonth
      ),
    [activity, selectedMonth]
  );

  const totalIncome = monthlyExpenses
    .filter((item) => item.type === "Income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpenses = monthlyExpenses
    .filter((item) => item.type === "Expense")
    .reduce((total, item) => total + item.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minStock
  );

  const pendingTasks = monthlyTasks.filter(
    (task) => getTaskStatus(task) === "Pending"
  ).length;

  const overdueTasks = monthlyTasks.filter(
    (task) => getTaskStatus(task) === "Overdue"
  ).length;

  const completedTasks = monthlyTasks.filter(
    (task) => task.status === "Done"
  ).length;

  function handleExportCsv() {
    const rows = [
      [
        "Section",
        "Date",
        "Name",
        "Category / Action",
        "Type / Status",
        "Quantity",
        "Unit",
        "Amount (PKR)",
        "Details",
        "User",
      ],
    ];

    // Current crop inventory
    crops.forEach((crop) => {
      rows.push([
        "Crop",
        "",
        crop.name,
        "Crop record",
        `${crop.health}% health`,
        crop.quantity,
        "kg",
        "",
        `Field: ${crop.field}`,
        "",
      ]);
    });

    // Monthly financial records
    monthlyExpenses.forEach((item) => {
      const crop = crops.find(
        (entry) => Number(entry.id) === Number(item.cropId)
      );

      rows.push([
        "Financial record",
        item.date,
        crop?.name || "Unknown crop",
        item.category,
        item.type,
        "",
        "",
        item.amount,
        item.notes || "",
        "",
      ]);
    });

    // Current inventory
    inventory.forEach((item) => {
      const stockStatus =
        item.quantity === 0
          ? "Out of Stock"
          : item.quantity <= item.minStock
            ? "Low Stock"
            : "In Stock";

      rows.push([
        "Inventory",
        "",
        item.name,
        item.category,
        stockStatus,
        item.quantity,
        item.unit,
        "",
        `Minimum stock: ${item.minStock}`,
        "",
      ]);
    });

    // Tasks due in the selected month
    monthlyTasks.forEach((task) => {
      const crop = crops.find(
        (entry) => Number(entry.id) === Number(task.cropId)
      );

      rows.push([
        "Farm task",
        task.dueDate,
        task.title,
        crop?.name || "Unknown crop",
        getTaskStatus(task),
        "",
        "",
        "",
        task.notes || "",
        "",
      ]);
    });

    // Activity for the selected month
    monthlyActivity.forEach((item) => {
      rows.push([
        "Activity log",
        item.timestamp,
        item.entity,
        item.action,
        item.role,
        "",
        "",
        "",
        item.details,
        item.user,
      ]);
    });

    downloadCsv(
      rows,
      `agriflow-report-${selectedMonth}.csv`
    );
  }

  const recentActivity = activity.slice(0, 20);

  return (
    <section className="reports-page">
      <div className="reports-heading">
        <div>
          <span className="reports-eyebrow">BUSINESS INSIGHTS</span>

          <h2>Reports & Activity Log</h2>

          <p>
            Review farm performance, monthly finances and recent
            system activity.
          </p>
        </div>

        <div className="reports-actions">
          <button
            type="button"
            className="reports-secondary-button"
            onClick={() => window.print()}
          >
            <Printer size={17} />
            Print / Save PDF
          </button>

          <button
            type="button"
            className="reports-primary-button"
            onClick={handleExportCsv}
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="reports-filter">
        <label htmlFor="report-month">Report month</label>

        <input
          id="report-month"
          type="month"
          value={selectedMonth}
          onChange={(event) =>
            setSelectedMonth(event.target.value)
          }
        />

        <span>
          Financial records, due tasks and logged activities for
          the selected month.
        </span>
      </div>

      <div className="reports-section-heading">
        <div>
          <span className="reports-eyebrow">MONTHLY FINANCES</span>
          <h3>Income & Profitability</h3>
        </div>

        <Wallet size={25} />
      </div>

      <div className="reports-summary-grid">
        <article className="reports-summary-card">
          <span className="reports-summary-icon">
            <TrendingUp size={22} />
          </span>

          <p>Monthly Income</p>
          <h3>{formatCurrency(totalIncome)}</h3>
        </article>

        <article className="reports-summary-card">
          <span className="reports-summary-icon">
            <TrendingDown size={22} />
          </span>

          <p>Monthly Expenses</p>
          <h3>{formatCurrency(totalExpenses)}</h3>
        </article>

        <article className="reports-summary-card">
          <span className="reports-summary-icon">
            <Wallet size={22} />
          </span>

          <p>Net Profit / Loss</p>

          <h3
            className={
              netProfit >= 0
                ? "reports-positive"
                : "reports-negative"
            }
          >
            {formatCurrency(netProfit)}
          </h3>
        </article>
      </div>

      <div className="reports-section-heading">
        <div>
          <span className="reports-eyebrow">FARM OPERATIONS</span>
          <h3>Current Farm Overview</h3>
        </div>

        <Sprout size={25} />
      </div>

      <div className="reports-summary-grid">
        <article className="reports-summary-card">
          <span className="reports-summary-icon">
            <Sprout size={22} />
          </span>

          <p>Crop Records</p>
          <h3>{crops.length}</h3>
        </article>

        <article className="reports-summary-card">
          <span className="reports-summary-icon">
            <Package size={22} />
          </span>

          <p>Inventory Items</p>
          <h3>{inventory.length}</h3>
        </article>

        <article className="reports-summary-card">
          <span className="reports-summary-icon">
            <AlertTriangle size={22} />
          </span>

          <p>Low Stock Items</p>
          <h3>{lowStockItems.length}</h3>
        </article>
      </div>

      <div className="reports-task-summary">
        <div className="reports-section-heading">
          <div>
            <span className="reports-eyebrow">TASK SCHEDULER</span>
            <h3>Task Status for {selectedMonth}</h3>
          </div>

          <ClipboardList size={25} />
        </div>

        <div className="reports-task-grid">
          <div>
            <ClockIcon />
            <span>Pending</span>
            <strong>{pendingTasks}</strong>
          </div>

          <div>
            <AlertTriangle size={21} />
            <span>Overdue</span>
            <strong>{overdueTasks}</strong>
          </div>

          <div>
            <CheckCircle2 size={21} />
            <span>Completed</span>
            <strong>{completedTasks}</strong>
          </div>
        </div>
      </div>

      <div className="reports-activity-section">
        <div className="reports-section-heading">
          <div>
            <span className="reports-eyebrow">AUDIT TRAIL</span>
            <h3>Recent Activity</h3>
          </div>

          <Activity size={25} />
        </div>

        {recentActivity.length > 0 ? (
          <div className="reports-activity-list">
            {recentActivity.map((item) => (
              <article className="reports-activity-item" key={item.id}>
                <span className="reports-activity-icon">
                  <FileText size={19} />
                </span>

                <div className="reports-activity-content">
                  <strong>{item.details}</strong>

                  <p>
                    {item.user} · {item.role} · {item.entity}
                  </p>

                  <time>
                    {new Date(item.timestamp).toLocaleString("en-PK", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Karachi",
                    })}
                  </time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="reports-empty">
            <Activity size={30} />

            <p>
              No activities recorded yet. Add, edit or delete a crop,
              farm task, inventory item or financial record to generate
              activity entries.
            </p>
          </div>
        )}

        <p className="reports-activity-note">
          The activity log records supported Redux operations after
          activity logging was enabled.
        </p>
      </div>

      <div className="reports-footer">
        Report month: {selectedMonth} · Generated from current AgriFlow
        records.
      </div>
    </section>
  );
}

function ClockIcon() {
  return <ClipboardList size={21} />;
}

export default Reports;