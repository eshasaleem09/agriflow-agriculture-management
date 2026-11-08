import { useSelector } from "react-redux";

import {
  Sprout,
  Wheat,
  ShoppingCart,
  Truck,
  CloudSun,
  TrendingUp,
  Droplets,
  Leaf,
  Wind,
  Sun,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FlaskConical,
  MapPin,
  ArrowUpRight,
  Users,
  UserCheck,
  UserX,
  Wallet,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  selectActiveWorkers,
  selectWorkersPresentToday,
  selectWorkersAbsentToday,
  selectMonthlyWagesPayable,
  selectWorkerAbsencePercentage,
} from "../app/redux/selectors/index.js";

// ==========================================
// DASHBOARD STATIC DATA
// ==========================================

const productionData = [
  { month: "Jan", production: 420 },
  { month: "Feb", production: 520 },
  { month: "Mar", production: 460 },
  { month: "Apr", production: 680 },
  { month: "May", production: 590 },
  { month: "Jun", production: 780 },
  { month: "Jul", production: 720 },
];

const cropDistribution = [
  { name: "Wheat", value: 35, color: "#c7f36b" },
  { name: "Rice", value: 28, color: "#a8c5a0" },
  { name: "Corn", value: 20, color: "#e8bd55" },
  { name: "Cotton", value: 17, color: "#739a70" },
];

const tasks = [
  {
    title: "Irrigation scheduled",
    detail: "North Field · 08:00 AM",
    status: "Upcoming",
    icon: Droplets,
  },
  {
    title: "Check soil nutrients",
    detail: "Wheat Field · 10:30 AM",
    status: "Pending",
    icon: FlaskConical,
  },
  {
    title: "Inspect growing crops",
    detail: "East Field · 02:00 PM",
    status: "Upcoming",
    icon: Sprout,
  },
];

const orders = [
  {
    id: "#ORD-1024",
    customer: "Ahmed Khan",
    crop: "Wheat",
    quantity: "500 kg",
    status: "Delivered",
  },
  {
    id: "#ORD-1025",
    customer: "Fatima Ali",
    crop: "Rice",
    quantity: "300 kg",
    status: "Pending",
  },
  {
    id: "#ORD-1026",
    customer: "Usman Malik",
    crop: "Corn",
    quantity: "200 kg",
    status: "Processing",
  },
];

// ==========================================
// DASHBOARD COMPONENT
// ==========================================

function Dashboard() {
  // Redux selectors MUST stay inside the component.

  const activeWorkers = useSelector(selectActiveWorkers);
  const presentToday = useSelector(selectWorkersPresentToday);
  const absentToday = useSelector(selectWorkersAbsentToday);
  const monthlyWages = useSelector(selectMonthlyWagesPayable);
  const absencePercentage = useSelector(
    selectWorkerAbsencePercentage
  );

  return (
    <div className="page-content">

      {/* FARM LANDSCAPE HERO */}

      <section className="farm-hero">
        <img
          src="/images/farm-landscape.avif"
          alt="Green agricultural fields"
          className="farm-hero-image"
        />

        <div className="farm-hero-overlay" />

        <div className="farm-hero-content">
          <span className="farm-hero-label">
            <Sprout size={16} />
            YOUR FARM AT A GLANCE
          </span>

          <h2>Growing a Better Tomorrow.</h2>

          <p>
            Monitor your crops, manage farm operations, and
            make smarter decisions for a healthier harvest.
          </p>

          <div className="farm-hero-location">
            <MapPin size={15} />
            Lahore, Pakistan
            <span />
            Kharif Season
          </div>
        </div>

        <div className="farm-hero-season">
          <div className="farm-hero-season-icon">
            <Wheat size={25} />
          </div>

          <div>
            <span>CURRENT SEASON</span>
            <strong>Kharif Season</strong>
            <small>June – October</small>
          </div>
        </div>
      </section>

      {/* STATISTICS */}

      <section className="stats-grid">

        <article className="stat-card">
          <div className="stat-top">
            <div className="stat-icon crops-icon">
              <Sprout size={22} />
            </div>

            <span className="stat-trend">
              <TrendingUp size={14} /> 12.5%
            </span>
          </div>

          <p>Total Crops</p>
          <h3>24</h3>

          <span className="stat-caption">
            Across your farmland
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div className="stat-icon production-icon">
              <Wheat size={22} />
            </div>

            <span className="stat-trend">
              <TrendingUp size={14} /> 8.2%
            </span>
          </div>

          <p>Total Production</p>

          <h3>
            12,450 <small>kg</small>
          </h3>

          <span className="stat-caption">
            Harvested this season
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div className="stat-icon orders-icon">
              <ShoppingCart size={22} />
            </div>

            <span className="stat-neutral">
              This month
            </span>
          </div>

          <p>Total Orders</p>
          <h3>156</h3>

          <span className="stat-caption">
            12 awaiting processing
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div className="stat-icon delivery-icon">
              <Truck size={22} />
            </div>

            <span className="stat-trend">
              <TrendingUp size={14} /> 5.4%
            </span>
          </div>

          <p>Deliveries</p>
          <h3>89</h3>

          <span className="stat-caption">
            Successfully delivered
          </span>
        </article>

      </section>

      {/* FARM HEALTH AND WEATHER */}
            {/* WORKERS & ATTENDANCE */}

      <section className="workers-dashboard-section">

        <div className="workers-dashboard-header">
          <div>
            <h3>Workers & Attendance</h3>
            <p>Daily workforce and monthly wage overview</p>
          </div>

          <span className="workers-live-badge">
            <span className="live-dot"></span>
            Workforce Overview
          </span>
        </div>

        <div className="workers-dashboard-grid">

          {/* ACTIVE WORKERS */}

          <article className="worker-stat-card">
            <div className="worker-stat-icon">
              <Users size={21} />
            </div>

            <div>
              <span>Active Workers</span>
              <h3>{activeWorkers.length}</h3>
              <small>Currently employed</small>
            </div>
          </article>

          {/* PRESENT TODAY */}

          <article className="worker-stat-card">
            <div className="worker-stat-icon present-icon">
              <UserCheck size={21} />
            </div>

            <div>
              <span>Present Today</span>
              <h3>{presentToday}</h3>
              <small>Attendance marked present</small>
            </div>
          </article>

          {/* ABSENT TODAY */}

          <article className="worker-stat-card">
            <div className="worker-stat-icon absent-icon">
              <UserX size={21} />
            </div>

            <div>
              <span>Absent Today</span>
              <h3>{absentToday}</h3>
              <small>Attendance marked absent</small>
            </div>
          </article>

          {/* MONTHLY WAGES */}

          <article className="worker-stat-card">
            <div className="worker-stat-icon wage-icon">
              <Wallet size={21} />
            </div>

            <div>
              <span>Monthly Wages</span>

              <h3 className="wage-value">
                PKR {monthlyWages.toLocaleString("en-PK", {
                  maximumFractionDigits: 0,
                })}
              </h3>

              <small>Calculated from attendance</small>
            </div>
          </article>

        </div>

        {/* ATTENDANCE SUMMARY */}

        <div className="attendance-summary">

          <div className="attendance-summary-top">
            <div>
              <strong>Daily Attendance Rate</strong>
              <p>Based on active workers</p>
            </div>

            <strong className="attendance-percentage">
              {(100 - absencePercentage).toFixed(1)}%
            </strong>
          </div>

          <div className="attendance-progress-track">
            <div
              className="attendance-progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, 100 - absencePercentage)
                )}%`,
              }}
            />
          </div>

          <div className="attendance-summary-footer">
            <span>
              {presentToday} Present
            </span>

            <span>
              {absentToday} Absent
            </span>

            <span>
              {activeWorkers.length} Active Workers
            </span>
          </div>

        </div>

        {/* ABSENCE ALERT */}

        {absencePercentage > 30 && activeWorkers.length > 0 && (
          <div className="attendance-warning">
            <UserX size={19} />

            <div>
              <strong>Attendance Needs Attention</strong>

              <p>
                More than 30% of active workers are absent today.
                Please review your attendance records.
              </p>
            </div>
          </div>
        )}

        {/* NO WORKERS MESSAGE */}

        {activeWorkers.length === 0 && (
          <div className="workers-empty-state">
            <Users size={25} />
            <p>No active workers found. Add workers to see your workforce overview.</p>
          </div>
        )}

      </section>

      <section className="dashboard-grid">

        <article className="panel farm-health-panel">

          <div className="panel-header">
            <div>
              <h3>Farm Health Overview</h3>
              <p>General farm condition indicators</p>
            </div>

            <span className="demo-label">
              DEMO DATA
            </span>
          </div>

          <div className="health-content">

            <div className="health-ring">

              <svg
                viewBox="0 0 140 140"
                role="img"
                aria-label="Demonstration farm health score: 86 out of 100"
              >
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  fill="none"
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="12"
                />

                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  fill="none"
                  stroke="#c7f36b"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="302 352"
                  transform="rotate(-90 70 70)"
                />
              </svg>

              <div className="health-ring-label">
                <strong>86</strong>
                <span>/100</span>
                <small>Good</small>
              </div>

            </div>

            <div className="health-legend">

              <div>
                <span className="legend-dot lime-dot" />
                <span>Excellent</span>
                <strong>35%</strong>
              </div>

              <div>
                <span className="legend-dot sage-dot" />
                <span>Good</span>
                <strong>40%</strong>
              </div>

              <div>
                <span className="legend-dot gold-dot" />
                <span>Average</span>
                <strong>15%</strong>
              </div>

              <div>
                <span className="legend-dot muted-dot" />
                <span>Needs attention</span>
                <strong>10%</strong>
              </div>

            </div>
          </div>

          <div className="health-footer">
            <TrendingUp size={15} />

            <span>
              Example score for the dashboard preview
            </span>
          </div>

        </article>

        <article className="panel weather-panel">

          <div className="panel-header">
            <div>
              <h3>Weather Today</h3>
              <p>Local farm conditions</p>
            </div>

            <Sun
              size={20}
              className="weather-sun-icon"
            />
          </div>

          <div className="weather-main">

            <div className="weather-temperature">
              <strong>28°</strong>
              <span>Partly cloudy</span>
              <small>Lahore, Pakistan</small>
            </div>

            <div className="weather-illustration">
              <CloudSun
                size={62}
                strokeWidth={1.3}
              />
            </div>

          </div>

          <div className="weather-details">

            <div>
              <Droplets size={16} />
              <span>Humidity</span>
              <strong>62%</strong>
            </div>

            <div>
              <Wind size={16} />
              <span>Wind speed</span>
              <strong>12 km/h</strong>
            </div>

            <div>
              <CloudSun size={16} />
              <span>Rain chance</span>
              <strong>20%</strong>
            </div>

          </div>

          <p className="weather-note">
            Sample weather data · Live updates not connected
          </p>

        </article>

      </section>

      {/* PRODUCTION CHART AND CROP DISTRIBUTION */}

      <section className="dashboard-grid">

        <article className="panel production-panel">

          <div className="panel-header">
            <div>
              <h3>Crop Production</h3>
              <p>Monthly harvest overview</p>
            </div>

            <select
              defaultValue="2026"
              aria-label="Production year"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="chart-summary">
            <strong>4,170 kg</strong>

            <span className="chart-growth">
              <TrendingUp size={14} /> 14.8%
            </span>

            <span className="chart-summary-label">
              Production in the last 7 months
            </span>
          </div>

          <div className="production-chart">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart
                data={productionData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -18,
                  bottom: 0,
                }}
              >

                <defs>
                  <linearGradient
                    id="productionGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#c7f36b"
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="95%"
                      stopColor="#c7f36b"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 5"
                  vertical={false}
                  stroke="rgba(220,240,215,0.13)"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#b2c6b5",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#b2c6b5",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value} kg`,
                    "Production",
                  ]}
                  contentStyle={{
                    background: "#173d2d",
                    border: "1px solid #496b4f",
                    borderRadius: "10px",
                    color: "#f5f5e9",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="#c7f36b"
                  strokeWidth={3}
                  fill="url(#productionGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </article>

        <article className="panel crop-distribution-panel">

          <div className="panel-header">
            <div>
              <h3>Crop Distribution</h3>
              <p>Illustrative share by crop</p>
            </div>

            <Sprout
              size={20}
              className="panel-accent-icon"
            />
          </div>

          <div className="distribution-chart">

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={cropDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  stroke="none"
                >

                  {cropDistribution.map((crop) => (
                    <Cell
                      key={crop.name}
                      fill={crop.color}
                    />
                  ))}

                </Pie>

                <Tooltip
                  formatter={(value) => [
                    `${value}%`,
                    "Share",
                  ]}
                  contentStyle={{
                    background: "#173d2d",
                    border: "1px solid #496b4f",
                    borderRadius: "10px",
                    color: "#f5f5e9",
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

            <div className="distribution-center">
              <strong>4</strong>
              <span>Crop types</span>
            </div>

          </div>

          <div className="crop-legend">

            {cropDistribution.map((crop) => (
              <div key={crop.name}>

                <span>
                  <i
                    style={{
                      background: crop.color,
                    }}
                  />
                  {crop.name}
                </span>

                <strong>{crop.value}%</strong>

              </div>
            ))}

          </div>

        </article>

      </section>

      {/* SOIL HEALTH INDICATORS */}

      <section className="panel soil-panel">

        <div className="panel-header">
          <div>
            <h3>Soil Health Summary</h3>
            <p>
              Example indicators for monitoring your farmland
            </p>
          </div>

          <span className="demo-label">
            DEMO DATA
          </span>
        </div>

        <div className="soil-metrics">

          <div className="soil-metric">

            <div className="soil-metric-icon">
              <Droplets size={21} />
            </div>

            <div className="soil-metric-content">

              <div>
                <span>Soil Moisture</span>
                <strong>68%</strong>
              </div>

              <div className="metric-track">
                <span style={{ width: "68%" }} />
              </div>

              <small>Example reading</small>

            </div>

          </div>

          <div className="soil-metric">

            <div className="soil-metric-icon">
              <FlaskConical size={21} />
            </div>

            <div className="soil-metric-content">

              <div>
                <span>Soil Fertility</span>
                <strong>82%</strong>
              </div>

              <div className="metric-track">
                <span style={{ width: "82%" }} />
              </div>

              <small>Illustrative indicator</small>

            </div>

          </div>

          <div className="soil-metric">

            <div className="soil-metric-icon">
              <Leaf size={21} />
            </div>

            <div className="soil-metric-content">

              <div>
                <span>Organic Matter</span>
                <strong>5.2%</strong>
              </div>

              <div className="metric-track">
                <span style={{ width: "52%" }} />
              </div>

              <small>Example reading</small>

            </div>

          </div>

        </div>

      </section>

      {/* UPCOMING FARM TASKS */}

      <section className="panel tasks-panel">

        <div className="panel-header">
          <div>
            <h3>Upcoming Farm Tasks</h3>
            <p>Example activities to organise your work</p>
          </div>

          <CalendarDays
            size={20}
            className="panel-accent-icon"
          />
        </div>

        <div className="task-list">

          {tasks.map((task, index) => {

            const TaskIcon = task.icon;

            return (
              <div
                className="task-item"
                key={task.title}
              >

                <div className="task-icon">
                  <TaskIcon size={19} />
                </div>

                <div className="task-description">
                  <strong>{task.title}</strong>
                  <span>{task.detail}</span>
                </div>

                <span className="task-status">

                  {index === 0 ? (
                    <Clock3 size={13} />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}

                  {task.status}

                </span>

              </div>
            );

          })}

        </div>

      </section>

      {/* RECENT ORDERS */}

      <section className="panel orders-panel">

        <div className="panel-header orders-header">

          <div>
            <h3>Recent Orders</h3>
            <p>Track customer orders and deliveries.</p>
          </div>

          <ArrowUpRight
            size={19}
            className="panel-accent-icon"
          />

        </div>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>CROP</th>
                <th>QUANTITY</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>

              {orders.map((order) => (

                <tr key={order.id}>

                  <td className="order-id">
                    {order.id}
                  </td>

                  <td>{order.customer}</td>
                  <td>{order.crop}</td>
                  <td>{order.quantity}</td>

                  <td>
                    <span
                      className={`status-badge ${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

      {/* DASHBOARD DISCLAIMER */}

      <p className="dashboard-disclaimer">
        <Sprout size={15} />

        Dashboard preview uses sample values. Connect real farm,
        weather, and soil data before relying on these indicators.
      </p>

    </div>
  );
}

export default Dashboard;