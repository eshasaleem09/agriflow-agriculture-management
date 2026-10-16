
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const CROPS_KEY = "agriflow-crops";
const BUYERS_KEY = "agriflow-buyers";
const HARVEST_KEY = "agriflow-harvest-schedule";
const ORDERS_KEY = "agriflow-orders";

const INITIAL_CROPS = [
  { name: "Wheat", quantity: 2500, health: 88 },
  { name: "Rice", quantity: 3200, health: 72 },
  { name: "Corn", quantity: 1800, health: 48 },
  { name: "Cotton", quantity: 950, health: 25 },
];

const INITIAL_HARVESTS = [
  { crop: "Corn", quantity: 800, status: "completed", date: "2026-10-12" },
  { crop: "Wheat", quantity: 1000, status: "planned", date: "2026-10-18" },
  { crop: "Rice", quantity: 1500, status: "planned", date: "2026-10-20" },
];

const INITIAL_ORDERS = [
  { id: "ORD-1024", status: "Delivered", quantity: 500, date: "2026-10-10" },
  { id: "ORD-1025", status: "Pending", quantity: 300, date: "2026-10-12" },
  { id: "ORD-1026", status: "Processing", quantity: 200, date: "2026-10-15" },
];

const HEALTH_COLORS = ["#398653", "#e7a83e", "#d65b50"];

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function Analytics() {
  const [crops, setCrops] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadData = () => {
      setCrops(readStorage(CROPS_KEY, INITIAL_CROPS));
      setBuyers(readStorage(BUYERS_KEY, []));
      setHarvests(readStorage(HARVEST_KEY, INITIAL_HARVESTS));
      setOrders(readStorage(ORDERS_KEY, INITIAL_ORDERS));
    };

    loadData();

    window.addEventListener("storage", loadData);
    window.addEventListener("focus", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  const productionData = crops.map((crop) => ({
    crop: crop.name ?? crop.crop ?? "Unknown",
    production: Number(crop.quantity ?? crop.stock ?? crop.production ?? 0),
  }));

  const healthData = [
    {
      name: "Healthy",
      value: crops.filter((crop) => Number(crop.health ?? crop.healthScore ?? 0) >= 70).length,
    },
    {
      name: "Needs Attention",
      value: crops.filter((crop) => {
        const health = Number(crop.health ?? crop.healthScore ?? 0);
        return health >= 40 && health < 70;
      }).length,
    },
    {
      name: "Critical",
      value: crops.filter((crop) => Number(crop.health ?? crop.healthScore ?? 0) < 40).length,
    },
  ];

  const completedHarvests = harvests.filter(
    (harvest) => String(harvest.status).toLowerCase() === "completed"
  );

  const totalHarvested = completedHarvests.reduce(
    (sum, harvest) => sum + Number(harvest.quantity ?? harvest.amount ?? 0),
    0
  );

  const totalSold = buyers.reduce(
    (sum, buyer) => sum + Number(buyer.quantity ?? buyer.quantitySold ?? 0),
    0
  );

  const harvestSalesData = [
    { category: "Harvested", quantity: totalHarvested },
    { category: "Sold", quantity: totalSold },
    {
      category: "Remaining",
      quantity: Math.max(
        0,
        productionData.reduce((sum, crop) => sum + crop.production, 0)
      ),
    },
  ];

  const ordersByDate = orders.reduce((result, order) => {
    const date = order.date ?? order.orderDate ?? order.createdAt;

    if (!date) return result;

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return result;

    const label = parsedDate.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
    });

    result[label] = (result[label] || 0) + 1;
    return result;
  }, {});

  const ordersOverTime = Object.entries(ordersByDate).map(([date, count]) => ({
    date,
    orders: count,
  }));
  const exportAnalyticsCSV = () => {
  const rows = [
    ["AgriFlow Analytics Report"],
    [],
    ["Production by Crop"],
    ["Crop", "Quantity (kg)"],
    ...productionData.map((item) => [item.crop, item.production]),
    [],
    ["Crop Health Distribution"],
    ["Health Status", "Number of Crops"],
    ...healthData.map((item) => [item.name, item.value]),
    [],
    ["Harvest and Sales"],
    ["Category", "Quantity (kg)"],
    ...harvestSalesData.map((item) => [item.category, item.quantity]),
    [],
    ["Orders Over Time"],
    ["Date", "Number of Orders"],
    ...ordersOverTime.map((item) => [item.date, item.orders]),
  ];

  const csvContent = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "agriflow-analytics.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

  return (
    <section className="analytics-page">
      <div className="page-heading analytics-heading">
  <div>
    <h2>Crop Analytics</h2>
    <p>Understand crop production, crop health, harvests, and sales.</p>
  </div>

  <button
    type="button"
    className="analytics-export-btn"
    onClick={exportAnalyticsCSV}
  >
    Export CSV
  </button>
</div>

      <div className="analytics-grid">
        <article className="panel analytics-card">
          <h3>Production by Crop</h3>
          <p>Current quantities recorded for each crop.</p>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kg`, "Quantity"]} />
                <Bar
                  dataKey="production"
                  name="Production"
                  fill="#398653"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel analytics-card">
          <h3>Crop Health Distribution</h3>
          <p>Health categories based on each crop's health score.</p>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {healthData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={HEALTH_COLORS[index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel analytics-card">
          <h3>Harvest vs. Sales</h3>
          <p>Completed harvest quantity and recorded buyer sales.</p>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={harvestSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kg`, "Quantity"]} />
                <Bar
                  dataKey="quantity"
                  name="Quantity"
                  fill="#70a77d"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel analytics-card">
          <h3>Orders Over Time</h3>
          <p>Number of orders grouped by their recorded dates.</p>

          {ordersOverTime.length > 0 ? (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#398653"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="analytics-empty">
              No dated orders are available yet.
            </p>
          )}
        </article>
      </div>

      <p className="analytics-note">
        Charts use the records currently available in your browser. Keep in mind
        that remaining stock is displayed separately from completed harvests
        and sales; these quantities are not necessarily a historical accounting.
      </p>
    </section>
  );
}

export default Analytics;
